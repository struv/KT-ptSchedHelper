import { NextRequest, NextResponse } from "next/server";
import { getData, saveData } from "@/lib/data";

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = request.headers.get("x-admin-password");

  if (!adminPassword || providedPassword !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, name, address, lat, lng } = await request.json();

  if (!type || !name) {
    return NextResponse.json(
      { error: "Type and name are required" },
      { status: 400 }
    );
  }

  if (!["providers", "staff", "offices"].includes(type)) {
    return NextResponse.json(
      { error: "Invalid type. Must be providers, staff, or offices" },
      { status: 400 }
    );
  }

  if (type === "offices" && !address) {
    return NextResponse.json(
      { error: "Address is required for offices" },
      { status: 400 }
    );
  }

  if (lat === undefined || lng === undefined) {
    return NextResponse.json(
      { error: "Coordinates (lat, lng) are required" },
      { status: 400 }
    );
  }

  try {
    const data = await getData();

    const exists = data[type as keyof typeof data].some(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      return NextResponse.json(
        { error: `${name} already exists in ${type}` },
        { status: 400 }
      );
    }

    const newEntry: Record<string, unknown> = {
      name,
      lat: Math.round(lat * 1000) / 1000,
      lng: Math.round(lng * 1000) / 1000,
    };

    if (type === "offices" && address) {
      newEntry.address = address;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data[type as keyof typeof data] as any[]).push(newEntry);
    await saveData(data);

    return NextResponse.json({
      success: true,
      message: `Added ${name} to ${type}`,
      entry: newEntry,
    });
  } catch (error) {
    console.error("Error adding entry:", error);
    return NextResponse.json(
      { error: "Failed to add entry" },
      { status: 500 }
    );
  }
}
