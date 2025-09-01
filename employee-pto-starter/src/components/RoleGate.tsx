"use client";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";

type Props = { roles: Array<"EMPLOYEE"|"MANAGER"|"ADMIN">; children: ReactNode; fallback?: ReactNode };

export default function RoleGate({ roles, children, fallback = null }: Props) {
  const { data } = useSession();
  const role = (data?.user as any)?.role as string | undefined;
  if (!role || !roles.includes(role as any)) return <>{fallback}</>;
  return <>{children}</>;
}
