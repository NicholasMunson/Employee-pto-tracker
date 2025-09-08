import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

// GET /api/policies/[id] - Get a specific PTO policy
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const policy = await prisma.pTOPolicy.findUnique({
      where: { id },
      include: {
        balances: {
          include: {
            employee: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
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
          },
        },
      },
    });

    if (!policy) {
      return NextResponse.json(
        {
          success: false,
          error: "PTO policy not found",
          message: "No PTO policy found with the provided ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: policy,
      message: "PTO policy retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching PTO policy:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch PTO policy",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/policies/[id] - Partially update a PTO policy
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, accrualHrsMo, carryoverMax, effectiveOn } = body;

    if (accrualHrsMo !== undefined && accrualHrsMo < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid values",
          message: "Accrual hours must be non-negative",
        },
        { status: 400 }
      );
    }

    if (carryoverMax !== undefined && carryoverMax < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid values",
          message: "Carryover max must be non-negative",
        },
        { status: 400 }
      );
    }

    const policy = await prisma.pTOPolicy.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(accrualHrsMo !== undefined && { accrualHrsMo }),
        ...(carryoverMax !== undefined && { carryoverMax }),
        ...(effectiveOn && { effectiveOn: new Date(effectiveOn) }),
      },
      include: {
        balances: {
          include: {
            employee: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: policy,
      message: "PTO policy updated successfully",
    });
  } catch (error) {
    console.error("Error updating PTO policy:", error);

    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "PTO policy not found",
          message: "No PTO policy found with the provided ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update PTO policy",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/policies/[id] - Delete a specific PTO policy
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.pTOPolicy.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "PTO policy deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting PTO policy:", error);

    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "PTO policy not found",
          message: "No PTO policy found with the provided ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete PTO policy",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
