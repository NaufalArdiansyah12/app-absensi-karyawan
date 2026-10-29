import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";

export async function GET() {
  await dataStore.init();
  return NextResponse.json({ offices: dataStore.offices });
}

export async function POST(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["SUPER_USER"]);
    if (errorResponse) return errorResponse;

    const body: any = await request.json();
    const { name, latitude, longitude, radiusMeters } = body;

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Nama, latitude, dan longitude wajib diisi" }, { status: 400 });
    }

    const newOffice = {
      id: `loc_${Date.now()}`,
      name,
      latitude: Number(latitude),
      longitude: Number(longitude),
      radiusMeters: Number(radiusMeters) || 100,
      isActive: true,
    };

    dataStore.offices.push(newOffice);

    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user!.userId,
      action: "OFFICE_CREATE",
      details: `Menambahkan lokasi kantor: ${name} (radius ${newOffice.radiusMeters}m)`,
      createdAt: Date.now(),
    });

    return NextResponse.json({ message: "Lokasi kantor berhasil disimpan", office: newOffice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
