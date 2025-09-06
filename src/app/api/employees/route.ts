import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

// GET /api/employees - List all employee profiles
export async function GET() {
  try {
    const employees = await prisma.employeeProfile.findMany({
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
        balances: {
          include: {
            policy: {
              select: {
                id: true,
                name: true,
                accrualHrsMo: true,
                carryoverMax: true,
              },
            },
          },
        },
        requests: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            hours: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: employees,
      count: employees.length,
      message: "Employee profiles retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch employees",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create a new employee profile
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, department, startDate, managerId, teamId } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    const employee = await prisma.employeeProfile.create({
      data: {
        userId,
        title,
        department,
        startDate: startDate ? new Date(startDate) : undefined,
        managerId,
        teamId,
      },
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
    });

    return NextResponse.json(
      {
        success: true,
        data: employee,
        message: "Employee profile created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating employee profile:", error);

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        {
          success: false,
          error: "User already has employee profile",
          message: "This user already has an employee profile",
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
          message: "User, manager, or team ID does not exist",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create employee profile",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/employees - Update an employee profile
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, department, startDate, managerId, teamId } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Employee profile ID is required",
        },
        { status: 400 }
      );
    }

    const employee = await prisma.employeeProfile.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(department !== undefined && { department }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(managerId !== undefined && { managerId }),
        ...(teamId !== undefined && { teamId }),
      },
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
    });

    return NextResponse.json({
      success: true,
      data: employee,
      message: "Employee profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating employee profile:", error);

    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Employee profile not found",
          message: "No employee profile found with the provided ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update employee profile",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/employees - Delete an employee profile
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Employee profile ID is required",
        },
        { status: 400 }
      );
    }

    await prisma.employeeProfile.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Employee profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee profile:", error);

    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Employee profile not found",
          message: "No employee profile found with the provided ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete employee profile",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
