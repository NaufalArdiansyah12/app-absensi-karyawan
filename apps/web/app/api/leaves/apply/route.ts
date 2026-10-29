import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";

export async function POST(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["EMPLOYEE", "SUPER_USER"]);
    if (errorResponse) return errorResponse;

    const body: any = await request.json();
    const { type, startDate, endDate, durationDays, reason, docKey } = body;

    if (!type || !startDate || !endDate || !durationDays || !reason) {
      return NextResponse.json(
        { error: "Field jenis cuti, tanggal mulai, tanggal selesai, durasi, dan alasan wajib diisi" },
        { status: 400 }
      );
    }

    const duration = Number(durationDays);
    if (duration <= 0) {
      return NextResponse.json(
        { error: "Durasi cuti harus lebih besar dari 0 hari" },
        { status: 400 }
      );
    }

    const fullUser = dataStore.users.find((u) => u.id === user!.userId);
    if (!fullUser) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // Cek saldo cuti tahunan di awal
    if (type === "CUTI_TAHUNAN" && fullUser.leaveQuota < duration) {
      return NextResponse.json(
        {
          error: `Saldo cuti tahunan tidak mencukupi. Sisa kuota: ${fullUser.leaveQuota} hari, permohonan: ${duration} hari`,
        },
        { status: 400 }
      );
    }

    // Status awal persis alur diagram: [Status: Menunggu GM]
    const newLeave = {
      id: `leave_${Date.now()}`,
      userId: fullUser.id,
      userName: fullUser.name,
      userDivision: fullUser.division,
      type,
      startDate,
      endDate,
      durationDays: duration,
      reason,
      docKey: docKey || null,
      status: "MENUNGGU_GM" as const,
      createdAt: Date.now(),
    };

    dataStore.leaves.unshift(newLeave);

    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: fullUser.id,
      action: "LEAVE_APPLY",
      details: `${fullUser.name} mengajukan ${type} (${duration} hari) - Menunggu GM`,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      message: "Permohonan cuti/izin berhasil diajukan dan sedang menunggu persetujuan GM",
      leave: newLeave,
      remainingQuota: fullUser.leaveQuota,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal mengajukan permohonan cuti" },
      { status: 500 }
    );
  }
}
