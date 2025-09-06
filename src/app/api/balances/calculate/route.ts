import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

// POST /api/balances/calculate - Calculate PTO balance for an employee
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, year, policyId } = body;

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

    const yearNum = parseInt(year);
    const yearStart = new Date(yearNum, 0, 1);
    const yearEnd = new Date(yearNum + 1, 0, 1);

    // Get the policy details
    const policy = await prisma.pTOPolicy.findUnique({
      where: { id: policyId },
    });

    if (!policy) {
      return NextResponse.json(
        {
          success: false,
          error: "Policy not found",
          message: "No policy found with the provided ID",
        },
        { status: 404 }
      );
    }

    // Get the employee's start date
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: "Employee not found",
          message: "No employee found with the provided ID",
        },
        { status: 404 }
      );
    }

    // Calculate accrual based on policy and employee start date
    let accrualMonths = 12;
    if (employee.startDate) {
      const startDate = new Date(employee.startDate);
      if (startDate.getFullYear() === yearNum) {
        // Employee started this year, calculate prorated accrual
        accrualMonths = 12 - startDate.getMonth();
      }
    }

    const totalAccrual = policy.accrualHrsMo * accrualMonths;

    // Get approved requests for the year
    const approvedRequests = await prisma.pTORequest.findMany({
      where: {
        employeeId,
        status: "APPROVED",
        startDate: {
          gte: yearStart,
          lt: yearEnd,
        },
      },
    });

    const totalUsed = approvedRequests.reduce(
      (sum, request) => sum + request.hours,
      0
    );

    // Get carryover from previous year
    const previousYearBalance = await prisma.pTOBalance.findUnique({
      where: {
        employeeId_year: {
          employeeId,
          year: yearNum - 1,
        },
      },
    });

    const carryover = previousYearBalance
      ? Math.min(
          previousYearBalance.accrued - previousYearBalance.used,
          policy.carryoverMax
        )
      : 0;

    const availableBalance = totalAccrual + carryover - totalUsed;

    // Check if there's an existing balance for this year
    const existingBalance = await prisma.pTOBalance.findUnique({
      where: {
        employeeId_year: {
          employeeId,
          year: yearNum,
        },
      },
    });

    const calculation = {
      employee: {
        id: employee.id,
        name: employee.user.name,
        email: employee.user.email,
        startDate: employee.startDate,
      },
      policy: {
        id: policy.id,
        name: policy.name,
        accrualHrsMo: policy.accrualHrsMo,
        carryoverMax: policy.carryoverMax,
      },
      year: yearNum,
      calculation: {
        accrualMonths,
        totalAccrual,
        carryover,
        totalUsed,
        availableBalance,
        approvedRequestsCount: approvedRequests.length,
      },
      existingBalance: existingBalance
        ? {
            id: existingBalance.id,
            accrued: existingBalance.accrued,
            used: existingBalance.used,
            carryover: existingBalance.carryover,
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: calculation,
      message: "PTO balance calculated successfully",
    });
  } catch (error) {
    console.error("Error calculating PTO balance:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate PTO balance",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
