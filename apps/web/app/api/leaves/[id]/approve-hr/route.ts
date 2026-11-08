import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";
import { transitionLeaveStatus, deductLeaveQuota } from "@/lib/leave-machine";
import { syncLeaveHrApprovalToD1, getKaryawanIdByNik } from "@/lib/d1-client";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dataStore.init();
    // Khusus role HR (atau Super User)
    const { user, errorResponse } = await authenticateRequest(request, ["HR", "SUPER_USER"]);
    if (errorResponse) return errorResponse;

    const body: any = await request.json();
    const { action, note } = body; // action: 'APPROVE' | 'REJECT'

    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json(
        { error: "Action harus 'APPROVE' atau 'REJECT'" },
        { status: 400 }
      );
    }

    const leave = dataStore.leaves.find((l) => l.id === params.id);
    if (!leave) {
      return NextResponse.json({ error: "Permohonan cuti tidak ditemukan" }, { status: 404 });
    }

    // Jalankan mesin transisi alur
    const transition = transitionLeaveStatus(leave.status, "HR", action);

    const employee = dataStore.users.find((u) => u.id === leave.userId);
    if (!employee) {
      return NextResponse.json({ error: "Karyawan pemohon tidak ditemukan" }, { status: 404 });
    }

    // Jika final disetujui, sistem kemas kini baki cuti
    if (transition.canDeductQuota) {
      employee.leaveQuota = deductLeaveQuota(
        employee.leaveQuota,
        leave.durationDays,
        leave.type
      );
    }

    leave.status = transition.nextStatus;
    leave.hrNote = note || "";
    leave.hrApprovedAt = Date.now();
    dataStore.syncApprovedLeaveAttendances();

    // Persist status approval HR ke Cloudflare D1
    const karyawanId = getKaryawanIdByNik(employee.nik);
    await syncLeaveHrApprovalToD1({
      karyawanId,
      tanggalMulai: leave.startDate,
      approved: action === "APPROVE",
      hrUserId: 3,
      hrNote: note,
      updatedLeaveQuota: employee.leaveQuota,
    }).catch((e) => console.warn("[D1 Sync HR Approval Error]", e));

    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user!.userId,
      action: `LEAVE_HR_${action}`,
      details: `${user!.name} (${user!.role}) ${action === "APPROVE" ? "menyetujui final" : "menolak"} cuti ${leave.userName}. Status: ${leave.status}`,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      message:
        action === "APPROVE"
          ? "Permohonan berhasil disetujui HR (Final) dan saldo cuti telah diperbarui"
          : "Permohonan ditolak oleh HR",
      leave,
      updatedUserQuota: employee.leaveQuota,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memproses persetujuan HR" },
      { status: 400 }
    );
  }
}
