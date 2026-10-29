import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";

export async function GET(request: Request) {
  await dataStore.init();
  const { user, errorResponse } = await authenticateRequest(request);
  if (errorResponse) return errorResponse;

  const fullUser = dataStore.users.find((u) => u.id === user!.userId);
  if (!fullUser) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: fullUser.id,
      nik: fullUser.nik,
      name: fullUser.name,
      email: fullUser.email,
      role: fullUser.role,
      division: fullUser.division,
      jobPosition: fullUser.jobPosition,
      leaveQuota: fullUser.leaveQuota,
    },
  });
}
