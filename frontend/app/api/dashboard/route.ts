import { NextResponse } from "next/server";
import { dashboardData } from "../../dashboard/data";

export async function GET() {
  return NextResponse.json(dashboardData, { headers: { "Cache-Control": "no-store" } });
}
