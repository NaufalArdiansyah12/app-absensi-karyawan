import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";

export async function GET(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request);
    if (errorResponse) return errorResponse;

    let slips = dataStore.payrolls;

    if (user!.role === "EMPLOYEE") {
      // Karyawan hanya bisa melihat slip gaji pribadinya yang sudah berstatus PUBLISHED
      slips = slips.filter(
        (s) => s.userId === user!.userId && s.status === "PUBLISHED"
      );
    }

    return NextResponse.json({
      slips,
      total: slips.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal mengambil data slip gaji" },
      { status: 500 }
    );
  }
}
