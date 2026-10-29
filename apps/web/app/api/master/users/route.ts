import { NextResponse } from "next/server";
import { authenticateRequest, hashPassword } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";

export async function GET(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["SUPER_USER", "HR", "GM"]);
    if (errorResponse) return errorResponse;

    const list = dataStore.users.map(({ passwordHash, ...safeUser }) => safeUser);
    return NextResponse.json({ users: list });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["SUPER_USER"]);
    if (errorResponse) return errorResponse;

    const body: any = await request.json();
    const { nik, name, email, password, role, division, jobPosition, baseSalary, leaveQuota } = body;

    if (!nik || !name || !email || !password || !role || !division || !jobPosition) {
      return NextResponse.json({ error: "Semua field master pengguna wajib diisi" }, { status: 400 });
    }

    const exists = dataStore.users.find(
      (u) => u.nik.toLowerCase() === nik.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      return NextResponse.json({ error: "NIK atau Email sudah terdaftar" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      id: `usr_${Date.now()}`,
      nik,
      name,
      email,
      passwordHash,
      role,
      division,
      jobPosition,
      baseSalary: Number(baseSalary) || 5000000,
      leaveQuota: Number(leaveQuota) || 12,
      createdAt: Date.now(),
    };

    dataStore.users.push(newUser);

    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user!.userId,
      action: "USER_CREATE",
      details: `Menambahkan user baru: ${name} (${role} - ${division})`,
      createdAt: Date.now(),
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return NextResponse.json({ message: "Pengguna berhasil dibuat", user: safeUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
