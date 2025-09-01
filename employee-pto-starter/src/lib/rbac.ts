export const can = {
  viewDirectory: (role: string) => ["EMPLOYEE", "MANAGER", "ADMIN"].includes(role),
  manageTeam: (role: string) => ["MANAGER", "ADMIN"].includes(role),
  adminOnly: (role: string) => role === "ADMIN",
};
