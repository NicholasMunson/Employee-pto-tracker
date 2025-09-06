import { NextResponse } from "next/server";
import { PrismaClient, PTOStatus } from "../../../../generated/prisma";

const prisma = new PrismaClient();

// GET /api/requests/[id] - Get a specific PTO request
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const ptoRequest = await prisma.pTORequest.findUnique({
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
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!ptoRequest) {
      return NextResponse.json(
        {
          success: false,
          error: "PTO request not found",
          message: "No PTO request found with the provided ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ptoRequest,
      message: "PTO request retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching PTO request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch PTO request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/requests/[id] - Partially update a PTO request
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { startDate, endDate, hours, status, approverId, note } = body;

    const updateData: any = {};

    if (startDate) {
      const start = new Date(startDate);
      updateData.startDate = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      updateData.endDate = end;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid date range",
            message: "Start date must be before end date",
          },
          { status: 400 }
        );
      }
    }

    if (hours !== undefined) {
      if (hours <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid hours",
            message: "Hours must be greater than 0",
          },
          { status: 400 }
        );
      }
      updateData.hours = parseFloat(hours);
    }

    if (status) updateData.status = status;
    if (approverId !== undefined) updateData.approverId = approverId;
    if (note !== undefined) updateData.note = note;

    const ptoRequest = await prisma.pTORequest.update({
      where: { id },
      data: updateData,
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
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: ptoRequest,
      message: "PTO request updated successfully",
    });
  } catch (error) {
    console.error("Error updating PTO request:", error);

    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "PTO request not found",
          message: "No PTO request found with the provided ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update PTO request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/requests/[id] - Delete a specific PTO request
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.pTORequest.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "PTO request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting PTO request:", error);

    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "PTO request not found",
          message: "No PTO request found with the provided ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete PTO request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
