import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

// GET /api/policies - List all PTO policies
export async function GET() {
  try {
    const policies = await prisma.pTOPolicy.findMany({
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
      orderBy: {
        effectiveOn: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: policies,
      count: policies.length,
      message: "PTO policies retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching PTO policies:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch PTO policies",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/policies - Create a new PTO policy
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, accrualHrsMo, carryoverMax, effectiveOn } = body;

    if (
      !name ||
      accrualHrsMo === undefined ||
      carryoverMax === undefined ||
      !effectiveOn
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message:
            "Name, accrualHrsMo, carryoverMax, and effectiveOn are required",
        },
        { status: 400 }
      );
    }

    if (accrualHrsMo < 0 || carryoverMax < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid values",
          message: "Accrual hours and carryover max must be non-negative",
        },
        { status: 400 }
      );
    }

    const policy = await prisma.pTOPolicy.create({
      data: {
        name,
        accrualHrsMo,
        carryoverMax,
        effectiveOn: new Date(effectiveOn),
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

    return NextResponse.json(
      {
        success: true,
        data: policy,
        message: "PTO policy created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating PTO policy:", error);

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        {
          success: false,
          error: "Policy name already exists",
          message: "A policy with this name already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create PTO policy",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/policies - Update a PTO policy
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, accrualHrsMo, carryoverMax, effectiveOn } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Policy ID is required",
        },
        { status: 400 }
      );
    }

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

// DELETE /api/policies - Delete a PTO policy
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Policy ID is required",
        },
        { status: 400 }
      );
    }

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
