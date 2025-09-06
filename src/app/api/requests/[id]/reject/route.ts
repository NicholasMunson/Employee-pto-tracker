import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../../generated/prisma";

const prisma = new PrismaClient();

// POST /api/requests/[id]/reject - Reject a PTO request
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

    // First, get the current request to check if it can be rejected
    const currentRequest = await prisma.pTORequest.findUnique({
      where: { id },
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
          message: "Only submitted requests can be rejected",
        },
        { status: 400 }
      );
    }

    // Check if the approver has permission to reject this request
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
          message: "Only managers and admins can reject requests",
        },
        { status: 403 }
      );
    }

    // Update the request status
    const updatedRequest = await prisma.pTORequest.update({
      where: { id },
      data: {
        status: "REJECTED",
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
      message: "PTO request rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting PTO request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reject PTO request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
