import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";

export async function GET() {
  await dataStore.init();
  return NextResponse.json({ shifts: dataStore.shifts });
}

export async function POST(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["SUPER_USER"]);
    if (errorResponse) return errorResponse;

    const body: any = await request.json();
    const { name, startTime, endTime, lateToleranceMinutes } = body;

    const newShift = {
      id: `shift_${Date.now()}`,
      name: name || "Shift Khusus",
      startTime: startTime || "08:00",
      endTime: endTime || "17:00",
      lateToleranceMinutes: Number(lateToleranceMinutes) || 15,
    };

    dataStore.shifts.push(newShift);
    return NextResponse.json({ message: "Shift berhasil disimpan", shift: newShift }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
