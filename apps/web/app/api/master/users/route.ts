import { NextResponse } from "next/server";
import { authenticateRequest, hashPassword } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";
import { syncShiftToD1, syncUserShiftToD1 } from "@/lib/d1-client";

export async function GET(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["SUPER_USER", "HR", "GM", "FINANCE"]);
    if (errorResponse) return errorResponse;

    // GM berada di bawah HR & Finance: hanya boleh melihat karyawan biasa
    const visible = user!.role === "GM" ? dataStore.users.filter((u) => u.role === "EMPLOYEE") : dataStore.users;
    const list = visible.map(({ passwordHash, ...safeUser }) => safeUser);
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

export async function PATCH(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["SUPER_USER", "HR", "GM", "FINANCE"]);
    if (errorResponse) return errorResponse;

    const body: any = await request.json();
    const {
      userId,
      shiftId,
      startTime,
      endTime,
      breakStartTime,
      breakEndTime,
      lateToleranceMinutes,
      name,
      email,
      division,
      jobPosition,
      leaveQuota,
      isVerified,
      hrEvalDiscipline,
      hrEvalPerformance,
      hrEvalScore,
      baseSalary,
      allowance,
      bonus,
    } = body;

    const target = dataStore.users.find((u) => u.id === userId);
    if (!target) {
      return NextResponse.json({ error: "Karyawan tidak ditemukan" }, { status: 404 });
    }
    if (user!.role === "GM" && target.role !== "EMPLOYEE") {
      return NextResponse.json({ error: "GM hanya dapat mengatur shift karyawan" }, { status: 403 });
    }

    if (user!.role === "FINANCE" || user!.role === "SUPER_USER") {
      if (baseSalary !== undefined) target.baseSalary = Number(baseSalary);
      if (allowance !== undefined) target.allowance = Number(allowance);
      if (bonus !== undefined) target.bonus = Number(bonus);
    }

    if (user!.role === "HR" || user!.role === "SUPER_USER") {
      if (name !== undefined) target.name = name;
      if (email !== undefined) target.email = email;
      if (division !== undefined) target.division = division;
      if (jobPosition !== undefined) target.jobPosition = jobPosition;
      if (leaveQuota !== undefined) target.leaveQuota = Number(leaveQuota);
      if (isVerified !== undefined) target.isVerified = Boolean(isVerified);
      if (hrEvalDiscipline !== undefined) target.hrEvalDiscipline = hrEvalDiscipline;
      if (hrEvalPerformance !== undefined) target.hrEvalPerformance = hrEvalPerformance;
      if (hrEvalScore !== undefined) target.hrEvalScore = Number(hrEvalScore);
    }

    let shift = target.shiftId ? dataStore.shifts.find((s) => s.id === target.shiftId) : undefined;
    if (shiftId) {
      shift = dataStore.shifts.find((s) => s.id === shiftId);
      if (!shift) {
        return NextResponse.json({ error: "Shift tidak ditemukan" }, { status: 404 });
      }
      if (startTime) shift.startTime = startTime;
      if (endTime) shift.endTime = endTime;
      if (breakStartTime) shift.breakStartTime = breakStartTime;
      if (breakEndTime) shift.breakEndTime = breakEndTime;
      if (lateToleranceMinutes !== undefined) shift.lateToleranceMinutes = Number(lateToleranceMinutes);
      target.shiftId = shift.id;

      await Promise.all([
        syncShiftToD1(shift).catch(() => {}),
        syncUserShiftToD1(target.nik, shift.id).catch(() => {}),
      ]);
    }

    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user!.userId,
      action: shiftId ? "USER_SHIFT_ASSIGN" : "USER_HR_UPDATE",
      details: shiftId
        ? `${user!.name} mengatur ${target.name} ke ${shift!.name} (${shift!.startTime}-${shift!.endTime})`
        : `${user!.name} memperbarui validasi/evaluasi karyawan ${target.name}`,
      createdAt: Date.now(),
    });

    const { passwordHash: _, ...safeUser } = target;
    return NextResponse.json({ message: "Data karyawan berhasil diperbarui", user: safeUser, shift });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
