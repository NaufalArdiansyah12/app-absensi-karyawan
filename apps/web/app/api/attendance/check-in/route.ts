import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";
import { isWithinRadius } from "@/lib/geofence";

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

    if (!radiusCheck.valid) {
      return NextResponse.json(
        {
          error: "Absensi ditolak: Anda berada di luar radius kantor yang diizinkan.",
          distanceMeters: radiusCheck.distanceMeters,
          allowedRadiusMeters: activeOffice.radiusMeters,
          officeName: activeOffice.name,
        },
        { status: 400 }
      );
    }

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

    // Hitung keterlambatan berdasarkan shift reguler (default 08:00 + toleransi 15 menit)
    const shiftStartHours = 8;
    const shiftStartMinutes = 0;
    const lateTolerance = 15;
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
