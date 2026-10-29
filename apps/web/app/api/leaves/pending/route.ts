import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";

export async function GET(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["GM", "HR", "SUPER_USER"]);
    if (errorResponse) return errorResponse;

    let pendingList = dataStore.leaves;

    if (user!.role === "GM") {
      // GM melihat permohonan dengan status MENUNGGU_GM
      pendingList = pendingList.filter((l) => l.status === "MENUNGGU_GM");
    } else if (user!.role === "HR") {
      // HR melihat permohonan dengan status MENUNGGU_HR
      pendingList = pendingList.filter((l) => l.status === "MENUNGGU_HR");
    }

    return NextResponse.json({
      pendingLeaves: pendingList,
      total: pendingList.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal mengambil antrean cuti" },
      { status: 500 }
    );
  }
}
