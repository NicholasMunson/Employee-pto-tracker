import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      password: await bcrypt.hash("admin123", 10),
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: {},
    create: {
      email: "manager@example.com",
      name: "Manny Manager",
      role: "MANAGER",
      password: await bcrypt.hash("manager123", 10),
      employee: {
        create: { title: "Engineering Manager", department: "Engineering" },
      },
    },
  });

  const team = await prisma.team.upsert({
    where: { name: "Engineering" },
    update: {},
    create: {
      name: "Engineering",
      description: "Builds product",
      managerId: manager.id,
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: "employee@example.com" },
    update: {},
    create: {
      email: "employee@example.com",
      name: "Eden Employee",
      role: "EMPLOYEE",
      password: await bcrypt.hash("employee123", 10),
      employee: {
        create: {
          title: "Frontend Dev",
          department: "Engineering",
          managerId: manager.id,
          teamId: team.id,
        },
      },
    },
    include: {
      employee: true,
    },
  });

  const policy = await prisma.pTOPolicy.upsert({
    where: { name: "US-Standard" },
    update: {},
    create: {
      name: "US-Standard",
      accrualHrsMo: 6.67,
      carryoverMax: 40,
      effectiveOn: new Date("2025-01-01"),
    },
  });

  await prisma.pTOBalance.upsert({
    where: {
      employeeId_year: {
        employeeId: employee.employee!.id,
        year: 2025,
      },
    },
    update: {},
    create: {
      employeeId: employee.employee!.id,
      year: 2025,
      policyId: policy.id,
      accrued: 40,
      used: 8,
      carryover: 12,
    },
  });

  console.log({ admin, manager, employee, policy });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
