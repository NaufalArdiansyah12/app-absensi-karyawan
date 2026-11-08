import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";
import { syncShiftToD1 } from "@/lib/d1-client";

export async function GET() {
  await dataStore.init();
  return NextResponse.json({ shifts: dataStore.shifts });
}

export async function POST(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["SUPER_USER", "HR"]);
    if (errorResponse) return errorResponse;

    const body: any = await request.json();
    const { name, startTime, endTime, lateToleranceMinutes } = body;

    const nextNum = dataStore.shifts.length + 1;
    const newShift = {
      id: `shift_${nextNum}`,
      name: (name || "Shift Khusus").trim(),
      startTime: startTime || "08:00",
      endTime: endTime || "17:00",
      lateToleranceMinutes: Number(lateToleranceMinutes ?? 15),
    };

    dataStore.shifts.push(newShift);
    await syncShiftToD1(newShift).catch(() => {});

    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user!.userId,
      action: "SHIFT_CREATE",
      details: `${user!.name} membuat shift ${newShift.name} (${newShift.startTime}-${newShift.endTime})`,
      createdAt: Date.now(),
    });

    return NextResponse.json({ message: "Shift berhasil disimpan", shift: newShift }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["SUPER_USER", "HR", "GM"]);
    if (errorResponse) return errorResponse;

    const body: any = await request.json();
    const { id, name, startTime, endTime, breakStartTime, breakEndTime, lateToleranceMinutes } = body;

    const shift = dataStore.shifts.find((s) => s.id === id);
    if (!shift) {
      return NextResponse.json({ error: "Shift tidak ditemukan" }, { status: 404 });
    }

    if (name) shift.name = String(name).trim();
    if (startTime) shift.startTime = startTime;
    if (endTime) shift.endTime = endTime;
    if (breakStartTime) shift.breakStartTime = breakStartTime;
    if (breakEndTime) shift.breakEndTime = breakEndTime;
    if (lateToleranceMinutes !== undefined) shift.lateToleranceMinutes = Number(lateToleranceMinutes);

    await syncShiftToD1(shift).catch(() => {});

    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user!.userId,
      action: "SHIFT_UPDATE",
      details: `${user!.name} mengubah jam ${shift.name} menjadi ${shift.startTime}-${shift.endTime}`,
      createdAt: Date.now(),
    });

    return NextResponse.json({ message: "Jam kerja shift diperbarui", shift });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
