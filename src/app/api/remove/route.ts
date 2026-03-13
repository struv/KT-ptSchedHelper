import { NextRequest, NextResponse } from "next/server";
import { getData, saveData } from "@/lib/data";

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = request.headers.get("x-admin-password");

  if (!adminPassword || providedPassword !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, name } = await request.json();

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

  try {
    const data = await getData();
    const items = data[type as keyof typeof data];

    const index = items.findIndex(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );

    if (index === -1) {
      return NextResponse.json(
        { error: `${name} not found in ${type}` },
        { status: 404 }
      );
    }

    const removed = items.splice(index, 1)[0];
    await saveData(data);

    return NextResponse.json({
      success: true,
      message: `Removed ${name} from ${type}`,
      removed,
    });
  } catch (error) {
    console.error("Error removing entry:", error);
    return NextResponse.json(
      { error: "Failed to remove entry" },
      { status: 500 }
    );
  }
}
