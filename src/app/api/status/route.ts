import { NextResponse } from "next/server";
import { PrismaClient, PTOStatus } from "../../../generated/prisma";

const prisma = new PrismaClient();

// GET /api/status - Get all available PTO statuses
export async function GET() {
  try {
    const statuses = Object.values(PTOStatus);

    return NextResponse.json({
      success: true,
      data: statuses,
      message: "PTO statuses retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching PTO statuses:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch PTO statuses",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
