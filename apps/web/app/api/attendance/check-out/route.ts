import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";
import { isWithinRadius } from "@/lib/geofence";
import { syncCheckOutToD1, getKaryawanIdByNik } from "@/lib/d1-client";

export async function POST(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["EMPLOYEE", "SUPER_USER"]);
    if (errorResponse) return errorResponse;

    const body: any = await request.json();
    const { latitude, longitude, photoDataUrlOrKey } = body;

    const todayDate = new Date().toISOString().split("T")[0];
    const attendance = dataStore.attendances.find(
      (a) => a.userId === user!.userId && a.date === todayDate
    );

    if (!attendance) {
      return NextResponse.json(
        { error: "Anda belum melakukan absensi masuk (check-in) hari ini" },
        { status: 400 }
      );
    }

    if (attendance.checkOutTime) {
      return NextResponse.json(
        { error: "Anda sudah melakukan absensi pulang (check-out) hari ini" },
        { status: 400 }
      );
    }

    const activeOffice = dataStore.offices.find((o) => o.isActive) || {
      id: "default_office",
      name: "Kantor Pusat Nutrilife",
      latitude: -6.175392,
      longitude: 106.827153,
      radiusMeters: 150,
      isActive: true,
    };

    const radiusCheck = isWithinRadius(
      Number(latitude),
      Number(longitude),
      activeOffice.latitude,
      activeOffice.longitude,
      activeOffice.radiusMeters
    );

    // Catatan: Validasi batas minimal radius kantor dinonaktifkan sementara
    // if (!radiusCheck.valid) { ... }

    const now = new Date();
    const currentTimeStr = now.toTimeString().split(" ")[0];
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Hitung lembur berdasarkan jam pulang shift karyawan
    const fullUser = dataStore.users.find((u) => u.id === user!.userId);
    const activeShift =
      dataStore.shifts.find((s) => s.id === (attendance.shiftId || fullUser?.shiftId || "shift_1")) ||
      dataStore.shifts[0];
    const [endH, endM] = (activeShift?.endTime || "17:00").split(":").map(Number);
    const shiftEndMinutes = endH * 60 + (endM || 0);
    const currentTotalMinutes = hours * 60 + minutes;
    const overtimeMinutes = Math.max(0, currentTotalMinutes - shiftEndMinutes);

    attendance.checkOutTime = currentTimeStr;
    attendance.checkOutLat = Number(latitude);
    attendance.checkOutLng = Number(longitude);
    attendance.checkOutPhotoKey = photoDataUrlOrKey || attendance.checkInPhotoKey;
    attendance.overtimeMinutes = overtimeMinutes;

    // Persist check-out ke Cloudflare D1
    const karyawanId = getKaryawanIdByNik(user!.nik);
    await syncCheckOutToD1({
      karyawanId,
      tanggal: attendance.date,
      waktuPulang: currentTimeStr,
      lintangPulang: Number(latitude),
      bujurPulang: Number(longitude),
    }).catch((e) => console.warn("[D1 Sync Check-out Error]", e));

    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user!.userId,
      action: "ATTENDANCE_CHECK_OUT",
      details: `${user!.name} check-out pada ${currentTimeStr} (Lembur: ${overtimeMinutes} mnt)`,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      message: "Absensi pulang berhasil dicatat",
      attendance,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memproses absensi pulang" },
      { status: 500 }
    );
  }
}
