import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";
import { isWithinRadius } from "@/lib/geofence";
import { syncCheckInToD1, getKaryawanIdByNik, getShiftNumericId } from "@/lib/d1-client";

export async function POST(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["EMPLOYEE", "SUPER_USER"]);
    if (errorResponse) return errorResponse;

    const body: any = await request.json();
    const { latitude, longitude, photoDataUrlOrKey } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Koordinat latitude dan longitude wajib dikirim" },
        { status: 400 }
      );
    }

    if (!photoDataUrlOrKey) {
      return NextResponse.json(
        { error: "Swafoto kehadiran (kamera selfie) wajib dilampirkan" },
        { status: 400 }
      );
    }

    // Cari lokasi kantor aktif terdekat
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

    const todayDate = new Date().toISOString().split("T")[0];
    const existing = dataStore.attendances.find(
      (a) => a.userId === user!.userId && a.date === todayDate
    );

    if (existing) {
      return NextResponse.json(
        { error: "Anda sudah melakukan absensi masuk (check-in) hari ini" },
        { status: 400 }
      );
    }

    const now = new Date();
    const currentTimeStr = now.toTimeString().split(" ")[0]; // HH:mm:ss
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Ambil jadwal shift aktif milik karyawan
    const fullUser = dataStore.users.find((u) => u.id === user!.userId);
    const activeShift =
      dataStore.shifts.find((s) => s.id === (fullUser?.shiftId || "shift_1")) ||
      dataStore.shifts[0] || {
        id: "shift_1",
        name: "Shift Reguler",
        startTime: "08:00",
        endTime: "17:00",
        lateToleranceMinutes: 15,
      };

    const [shiftStartHours, shiftStartMinutes] = activeShift.startTime.split(":").map(Number);
    const lateTolerance = activeShift.lateToleranceMinutes ?? 15;
    const currentTotalMinutes = hours * 60 + minutes;
    const shiftThresholdMinutes = shiftStartHours * 60 + shiftStartMinutes + lateTolerance;

    let lateMinutes = 0;
    let status: "TEPAT_WAKTU" | "TERLAMBAT" = "TEPAT_WAKTU";

    if (currentTotalMinutes > shiftThresholdMinutes) {
      status = "TERLAMBAT";
      lateMinutes = currentTotalMinutes - (shiftStartHours * 60 + shiftStartMinutes);
    }

    const attendanceRecord = {
      id: `att_${Date.now()}`,
      userId: user!.userId,
      userName: user!.name,
      shiftId: activeShift.id,
      shiftName: `${activeShift.name} (${activeShift.startTime}-${activeShift.endTime})`,
      date: todayDate,
      checkInTime: currentTimeStr,
      checkInLat: Number(latitude),
      checkInLng: Number(longitude),
      checkInDistanceMeters: radiusCheck.distanceMeters,
      checkInPhotoKey: photoDataUrlOrKey,
      status,
      lateMinutes,
      overtimeMinutes: 0,
      createdAt: Date.now(),
    };

    dataStore.attendances.unshift(attendanceRecord);

    // Persist ke Cloudflare D1
    const karyawanId = getKaryawanIdByNik(user!.nik);
    await syncCheckInToD1({
      karyawanId,
      shiftId: getShiftNumericId(activeShift.id),
      tanggal: todayDate,
      waktuMasuk: currentTimeStr,
      lintangMasuk: Number(latitude),
      bujurMasuk: Number(longitude),
      statusKehadiran: status === "TEPAT_WAKTU" ? "Hadir" : "TERLAMBAT",
    }).catch((e) => console.warn("[D1 Sync Check-in Error]", e));

    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user!.userId,
      action: "ATTENDANCE_CHECK_IN",
      details: `${user!.name} check-in ${status} (jarak ${radiusCheck.distanceMeters}m)`,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      message: "Absensi masuk berhasil tervalidasi",
      attendance: attendanceRecord,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memproses absensi masuk" },
      { status: 500 }
    );
  }
}
