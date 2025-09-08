import { NextResponse } from "next/server";
import { PrismaClient, PTOStatus } from "../../../generated/prisma";

const prisma = new PrismaClient();

// GET /api/requests - List all PTO requests
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const status = searchParams.get("status") as PTOStatus;
    const approverId = searchParams.get("approverId");
    const year = searchParams.get("year");

    const whereClause: any = {};
    if (employeeId) whereClause.employeeId = employeeId;
    if (status) whereClause.status = status;
    if (approverId) whereClause.approverId = approverId;
    if (year) {
      const yearNum = parseInt(year);
      whereClause.startDate = {
        gte: new Date(yearNum, 0, 1),
        lt: new Date(yearNum + 1, 0, 1),
      };
    }

    const requests = await prisma.pTORequest.findMany({
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
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { startDate: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: requests,
      count: requests.length,
      message: "PTO requests retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching PTO requests:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch PTO requests",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/requests - Create a new PTO request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, startDate, endDate, hours, status, approverId, note } =
      body;

    if (!employeeId || !startDate || !endDate || hours === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Employee ID, start date, end date, and hours are required",
        },
        { status: 400 }
      );
    }

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

    const ptoRequest = await prisma.pTORequest.create({
      data: {
        employeeId,
        startDate: start,
        endDate: end,
        hours: parseFloat(hours),
        status: status || "DRAFT",
        approverId,
        note,
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

    return NextResponse.json(
      {
        success: true,
        data: ptoRequest,
        message: "PTO request created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating PTO request:", error);

    if (
      error instanceof Error &&
      error.message.includes("Foreign key constraint")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid reference",
          message: "Employee or approver ID does not exist",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create PTO request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/requests - Update a PTO request
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, startDate, endDate, hours, status, approverId, note } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Request ID is required",
        },
        { status: 400 }
      );
    }

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

// DELETE /api/requests - Delete a PTO request
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Request ID is required",
        },
        { status: 400 }
      );
    }

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
