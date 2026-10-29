import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";

export async function GET(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request);
    if (errorResponse) return errorResponse;

    const fullUser = dataStore.users.find((u) => u.id === user!.userId);
    const myLeaves = dataStore.leaves.filter((l) => l.userId === user!.userId);

    return NextResponse.json({
      leaves: myLeaves,
      leaveQuota: fullUser ? fullUser.leaveQuota : 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal mengambil riwayat permohonan" },
      { status: 500 }
    );
  }
}
