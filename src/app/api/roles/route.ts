import { NextResponse } from "next/server";
import { PrismaClient, Role } from "../../../generated/prisma";

const prisma = new PrismaClient();

// GET /api/roles - List all available roles
export async function GET() {
  try {
    const roles = Object.values(Role);

    return NextResponse.json({
      success: true,
      data: roles,
      message: "Roles retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch roles",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
