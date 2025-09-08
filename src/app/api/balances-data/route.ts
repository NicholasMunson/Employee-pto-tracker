import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

// GET /api/balances - List all PTO balances
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const year = searchParams.get("year");
    const policyId = searchParams.get("policyId");

    const whereClause: any = {};
    if (employeeId) whereClause.employeeId = employeeId;
    if (year) whereClause.year = parseInt(year);
    if (policyId) whereClause.policyId = policyId;

    const balances = await prisma.pTOBalance.findMany({
      where: whereClause,
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
      orderBy: [{ year: "desc" }, { employee: { user: { name: "asc" } } }],
    });

    return NextResponse.json({
      success: true,
      data: balances,
      count: balances.length,
      message: "PTO balances retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching PTO balances:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch PTO balances",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/balances - Create a new PTO balance
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, year, policyId, accrued, used, carryover } = body;

    if (!employeeId || !year || !policyId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Employee ID, year, and policy ID are required",
        },
        { status: 400 }
      );
    }

    if (year < 2000 || year > 3000) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid year",
          message: "Year must be between 2000 and 3000",
        },
        { status: 400 }
      );
    }

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

    const balance = await prisma.pTOBalance.create({
      data: {
        employeeId,
        year: parseInt(year),
        policyId,
        accrued: accrued || 0,
        used: used || 0,
        carryover: carryover || 0,
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

    return NextResponse.json(
      {
        success: true,
        data: balance,
        message: "PTO balance created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating PTO balance:", error);

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        {
          success: false,
          error: "Balance already exists",
          message:
            "A balance for this employee, year, and policy combination already exists",
        },
        { status: 409 }
      );
    }

    if (
      error instanceof Error &&
      error.message.includes("Foreign key constraint")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid reference",
          message: "Employee or policy ID does not exist",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create PTO balance",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/balances - Update a PTO balance
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, accrued, used, carryover } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Balance ID is required",
        },
        { status: 400 }
      );
    }

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

// DELETE /api/balances - Delete a PTO balance
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Balance ID is required",
        },
        { status: 400 }
      );
    }

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
