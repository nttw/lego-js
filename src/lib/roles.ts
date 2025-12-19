export function isAdminRole(role: unknown): boolean {
  if (!role) return false;
  if (Array.isArray(role)) return role.includes("admin");
  if (typeof role === "string") {
    return role
      .split(",")
      .map((r) => r.trim())
      .includes("admin");
  }
  return false;
}
