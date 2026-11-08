import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";
import { syncCheckInToD1, syncCheckOutToD1, getKaryawanIdByNik, getShiftNumericId } from "@/lib/d1-client";

export async function GET(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request);
    if (errorResponse) return errorResponse;

    let records = dataStore.attendances;

    // Karyawan hanya bisa melihat histori absensinya sendiri
    if (user!.role === "EMPLOYEE") {
      records = records.filter((a) => a.userId === user!.userId);
    }

    // GM hanya memonitor karyawan biasa (di bawah HR & Finance)
    if (user!.role === "GM") {
      const ids = new Set(dataStore.users.filter((u) => u.role === "EMPLOYEE").map((u) => u.id));
      records = records.filter((a) => ids.has(a.userId));
    }

    return NextResponse.json({
      attendances: records,
      total: records.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal mengambil data kehadiran" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["GM", "HR", "SUPER_USER"]);
    if (errorResponse) return errorResponse;

    const body: any = await request.json();
    const { userId, date, checkInTime, checkOutTime, status } = body;

    const emp = dataStore.users.find((u) => u.id === userId);
    if (!emp || !date) {
      return NextResponse.json({ error: "Karyawan atau tanggal tidak valid" }, { status: 400 });
    }

    const shift =
      dataStore.shifts.find((s) => s.id === (emp.shiftId || "shift_1")) ||
      dataStore.shifts[0] || { id: "shift_1", name: "Shift Reguler", startTime: "08:00", endTime: "17:00", lateToleranceMinutes: 15 };

    const isPresent = status === "TEPAT_WAKTU" || status === "TERLAMBAT";
    const inStr = isPresent && checkInTime && checkInTime !== "-" ? checkInTime : "-";
    const outStr = isPresent && checkOutTime && checkOutTime !== "-" ? checkOutTime : "-";

    let lateMinutes = 0;
    let finalStatus = status || "TEPAT_WAKTU";
    if (isPresent && inStr !== "-") {
      const [ih, im] = inStr.split(":").map(Number);
      const [sh, sm] = shift.startTime.split(":").map(Number);
      const diff = (ih * 60 + (im || 0)) - (sh * 60 + (sm || 0));
      if (diff > (shift.lateToleranceMinutes ?? 15)) {
        lateMinutes = diff;
        finalStatus = "TERLAMBAT";
      } else if (status === "TERLAMBAT") {
        lateMinutes = Math.max(0, diff);
      }
    }

    let overtimeMinutes = 0;
    if (isPresent && outStr !== "-") {
      const [oh, om] = outStr.split(":").map(Number);
      const [eh, em] = shift.endTime.split(":").map(Number);
      overtimeMinutes = Math.max(0, (oh * 60 + (om || 0)) - (eh * 60 + (em || 0)));
    }

    let rec = dataStore.attendances.find((a) => a.userId === userId && a.date === date);
    if (rec) {
      rec.checkInTime = inStr;
      rec.checkOutTime = outStr;
      rec.status = finalStatus;
      rec.lateMinutes = lateMinutes;
      rec.overtimeMinutes = overtimeMinutes;
      rec.shiftId = shift.id;
      rec.shiftName = `${shift.name} (${shift.startTime}-${shift.endTime})`;
    } else {
      rec = {
        id: `att_manual_${Date.now()}`,
        userId: emp.id,
        userName: emp.name,
        shiftId: shift.id,
        shiftName: `${shift.name} (${shift.startTime}-${shift.endTime})`,
        date,
        checkInTime: inStr,
        checkInLat: 0,
        checkInLng: 0,
        checkInDistanceMeters: 0,
        checkInPhotoKey: "",
        checkOutTime: outStr,
        status: finalStatus,
        lateMinutes,
        overtimeMinutes,
        createdAt: Date.now(),
      };
      dataStore.attendances.unshift(rec);
    }

    const karyawanId = getKaryawanIdByNik(emp.nik);
    await syncCheckInToD1({
      karyawanId,
      shiftId: getShiftNumericId(shift.id),
      tanggal: date,
      waktuMasuk: inStr === "-" ? "" : inStr,
      lintangMasuk: rec.checkInLat || 0,
      bujurMasuk: rec.checkInLng || 0,
      statusKehadiran: finalStatus === "TEPAT_WAKTU" ? "Hadir" : finalStatus,
    }).catch(() => {});

    if (outStr !== "-") {
      await syncCheckOutToD1({
        karyawanId,
        tanggal: date,
        waktuPulang: outStr,
        lintangPulang: rec.checkOutLat || 0,
        bujurPulang: rec.checkOutLng || 0,
      }).catch(() => {});
    }

    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user!.userId,
      action: "ATTENDANCE_OVERRIDE",
      details: `${user!.name} mengoreksi absensi ${emp.name} (${date}) menjadi ${finalStatus}`,
      createdAt: Date.now(),
    });

    return NextResponse.json({ attendance: rec });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memperbarui absensi" },
      { status: 500 }
    );
  }
}
