import { NextResponse } from "next/server";
import { getData } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getData();
    return NextResponse.json({
      providers: data.providers || [],
      staff: data.staff || [],
      offices: data.offices || [],
    });
  } catch (error) {
    console.error("Error fetching data from Blob:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
