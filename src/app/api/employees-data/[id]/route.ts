import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

// GET /api/employees/[id] - Get a specific employee profile
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const employee = await prisma.employeeProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
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
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
                effectiveOn: true,
              },
            },
          },
        },
        requests: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: "Employee profile not found",
          message: "No employee profile found with the provided ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: employee,
      message: "Employee profile retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching employee profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch employee profile",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/employees/[id] - Partially update an employee profile
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, department, startDate, managerId, teamId } = body;

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

// DELETE /api/employees/[id] - Delete a specific employee profile
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
