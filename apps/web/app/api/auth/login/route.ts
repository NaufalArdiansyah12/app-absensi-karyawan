import { NextResponse } from "next/server";
import { dataStore } from "@/lib/store";
import { verifyPassword, signJwt } from "@/lib/auth-jwt";

export async function POST(request: Request) {
  try {
    await dataStore.init();
    const body: any = await request.json();
    const { nikOrEmail, password } = body;

    if (!nikOrEmail || !password) {
      return NextResponse.json(
        { error: "NIK/Email dan Password wajib diisi" },
        { status: 400 }
      );
    }

    const user = dataStore.users.find(
      (u) =>
        u.nik.toLowerCase() === nikOrEmail.toLowerCase() ||
        u.email.toLowerCase() === nikOrEmail.toLowerCase()
    );

    if (!user) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan atau NIK/Email salah" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Password tidak sesuai" },
        { status: 401 }
      );
    }

    const tokenPayload = {
      userId: user.id,
      nik: user.nik,
      name: user.name,
      role: user.role,
      division: user.division,
      jobPosition: user.jobPosition,
    };

    const token = await signJwt(tokenPayload, "7d");

    // Catat log
    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user.id,
      action: "USER_LOGIN",
      details: `${user.name} (${user.role}) berhasil masuk ke sistem`,
      createdAt: Date.now(),
    });

    const response = NextResponse.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        nik: user.nik,
        name: user.name,
        email: user.email,
        role: user.role,
        division: user.division,
        jobPosition: user.jobPosition,
        leaveQuota: user.leaveQuota,
      },
    });

    // Set cookie untuk session browser Web
    response.cookies.set("nutrilife_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 hari
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
