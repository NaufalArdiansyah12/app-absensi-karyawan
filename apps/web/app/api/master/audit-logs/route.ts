import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";

export async function GET(request: Request) {
  try {
    await dataStore.init();
    const { errorResponse } = await authenticateRequest(request, ["SUPER_USER"]);
    if (errorResponse) return errorResponse;

    return NextResponse.json({ auditLogs: dataStore.auditLogs.slice(0, 100) });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
