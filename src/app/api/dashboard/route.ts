import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

// GET /api/dashboard - Get dashboard data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const year =
      searchParams.get("year") || new Date().getFullYear().toString();

    const yearNum = parseInt(year);
    const yearStart = new Date(yearNum, 0, 1);
    const yearEnd = new Date(yearNum + 1, 0, 1);

    // Get basic counts
    const [
      totalUsers,
      totalEmployees,
      totalTeams,
      totalPolicies,
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.employeeProfile.count(),
      prisma.team.count(),
      prisma.pTOPolicy.count(),
      prisma.pTORequest.count({
        where: {
          startDate: {
            gte: yearStart,
            lt: yearEnd,
          },
        },
      }),
      prisma.pTORequest.count({
        where: {
          status: "SUBMITTED",
          startDate: {
            gte: yearStart,
            lt: yearEnd,
          },
        },
      }),
      prisma.pTORequest.count({
        where: {
          status: "APPROVED",
          startDate: {
            gte: yearStart,
            lt: yearEnd,
          },
        },
      }),
      prisma.pTORequest.count({
        where: {
          status: "REJECTED",
          startDate: {
            gte: yearStart,
            lt: yearEnd,
          },
        },
      }),
    ]);

    // Get recent requests
    const recentRequests = await prisma.pTORequest.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
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
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get requests by status for the year
    const requestsByStatus = await prisma.pTORequest.groupBy({
      by: ["status"],
      where: {
        startDate: {
          gte: yearStart,
          lt: yearEnd,
        },
      },
      _count: {
        status: true,
      },
    });

    // Get monthly request counts for the year
    const monthlyRequests = await prisma.$queryRaw`
      SELECT
        strftime('%m', startDate) as month,
        COUNT(*) as count
      FROM PTORequest
      WHERE startDate >= ${yearStart} AND startDate < ${yearEnd}
      GROUP BY strftime('%m', startDate)
      ORDER BY month
    `;

    // If userId is provided, get user-specific data
    let userData = null;
    if (userId) {
      const [user, employeeProfile] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        }),
        prisma.employeeProfile.findUnique({
          where: { userId },
          include: {
            balances: {
              where: { year: yearNum },
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
              where: {
                startDate: {
                  gte: yearStart,
                  lt: yearEnd,
                },
              },
              include: {
                approver: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
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
        }),
      ]);

      if (user && employeeProfile) {
        userData = {
          user,
          employeeProfile,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalEmployees,
          totalTeams,
          totalPolicies,
          totalRequests,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
        },
        recentRequests,
        requestsByStatus: requestsByStatus.map((item) => ({
          status: item.status,
          count: item._count.status,
        })),
        monthlyRequests,
        userData,
        year: yearNum,
      },
      message: "Dashboard data retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
