import { NextResponse } from "next/server";
import { PrismaClient, PTOStatus } from "../../../../../generated/prisma";

const prisma = new PrismaClient();

// POST /api/requests/[id]/approve - Approve a PTO request
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { approverId, note } = body;

    if (!approverId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Approver ID is required",
        },
        { status: 400 }
      );
    }

    // First, get the current request to check if it can be approved
    const currentRequest = await prisma.pTORequest.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            balances: {
              include: {
                policy: true,
              },
            },
          },
        },
      },
    });

    if (!currentRequest) {
      return NextResponse.json(
        {
          success: false,
          error: "PTO request not found",
          message: "No PTO request found with the provided ID",
        },
        { status: 404 }
      );
    }

    if (currentRequest.status !== "SUBMITTED") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request status",
          message: "Only submitted requests can be approved",
        },
        { status: 400 }
      );
    }

    // Check if the approver has permission to approve this request
    // This is a simplified check - in a real app, you'd have more complex authorization logic
    const approver = await prisma.user.findUnique({
      where: { id: approverId },
    });

    if (
      !approver ||
      (approver.role !== "MANAGER" && approver.role !== "ADMIN")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Only managers and admins can approve requests",
        },
        { status: 403 }
      );
    }

    // Update the request status
    const updatedRequest = await prisma.pTORequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        approverId,
        note: note || currentRequest.note,
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

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: "PTO request approved successfully",
    });
  } catch (error) {
    console.error("Error approving PTO request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to approve PTO request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
