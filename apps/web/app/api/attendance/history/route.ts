import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";

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
