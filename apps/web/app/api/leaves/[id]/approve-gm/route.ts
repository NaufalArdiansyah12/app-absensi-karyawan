import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";
import { transitionLeaveStatus } from "@/lib/leave-machine";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dataStore.init();
    // Khusus role GM (atau Super User)
    const { user, errorResponse } = await authenticateRequest(request, ["GM", "SUPER_USER"]);
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
    const transition = transitionLeaveStatus(leave.status, "GM", action);

    leave.status = transition.nextStatus;
    leave.gmNote = note || "";
    leave.gmApprovedAt = Date.now();

    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user!.userId,
      action: `LEAVE_GM_${action}`,
      details: `${user!.name} (${user!.role}) ${action === "APPROVE" ? "menyetujui" : "menolak"} cuti ${leave.userName}. Status: ${leave.status}`,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      message:
        action === "APPROVE"
          ? "Permohonan disetujui GM dan diteruskan ke antrean HR"
          : "Permohonan ditolak oleh GM",
      leave,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memproses persetujuan GM" },
      { status: 400 }
    );
  }
}
