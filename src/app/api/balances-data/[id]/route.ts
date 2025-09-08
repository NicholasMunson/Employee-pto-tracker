import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

// GET /api/balances/[id] - Get a specific PTO balance
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const balance = await prisma.pTOBalance.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        policy: {
          select: {
            id: true,
            name: true,
            accrualHrsMo: true,
            carryoverMax: true,
            effectiveOn: true,
          },
        },
      },
    });

    if (!balance) {
      return NextResponse.json(
        {
          success: false,
          error: "PTO balance not found",
          message: "No PTO balance found with the provided ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: balance,
      message: "PTO balance retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching PTO balance:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch PTO balance",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/balances/[id] - Partially update a PTO balance
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { accrued, used, carryover } = body;

    if (accrued !== undefined && accrued < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid values",
          message: "Accrued hours must be non-negative",
        },
        { status: 400 }
      );
    }

    if (used !== undefined && used < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid values",
          message: "Used hours must be non-negative",
        },
        { status: 400 }
      );
    }

    if (carryover !== undefined && carryover < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid values",
          message: "Carryover hours must be non-negative",
        },
        { status: 400 }
      );
    }

    const balance = await prisma.pTOBalance.update({
      where: { id },
      data: {
        ...(accrued !== undefined && { accrued }),
        ...(used !== undefined && { used }),
        ...(carryover !== undefined && { carryover }),
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        policy: {
          select: {
            id: true,
            name: true,
            accrualHrsMo: true,
            carryoverMax: true,
            effectiveOn: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: balance,
      message: "PTO balance updated successfully",
    });
  } catch (error) {
    console.error("Error updating PTO balance:", error);

    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "PTO balance not found",
          message: "No PTO balance found with the provided ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update PTO balance",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/balances/[id] - Delete a specific PTO balance
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.pTOBalance.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "PTO balance deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting PTO balance:", error);

    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "PTO balance not found",
          message: "No PTO balance found with the provided ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete PTO balance",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
