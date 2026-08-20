export type Role = "CUSTOMER" | "STAFF" | "BUSINESS_OWNER" | "ADMIN"

export interface RoleConfig {
  label: string
  description: string
  dashboardPath: string
  navItems: { label: string; href: string }[]
  permissions: Permission[]
}

export type Resource =
  | "booking"
  | "queue"
  | "service"
  | "business"
  | "staff"
  | "user"
  | "admin"

export type Action = "create" | "read" | "update" | "delete" | "manage"

export type Permission = `${Resource}:${Action}`

const roleConfigs: Record<Role, RoleConfig> = {
  CUSTOMER: {
    label: "Customer",
    description: "Book services and join queues",
    dashboardPath: "/dashboard/customer",
    navItems: [
      { label: "My Bookings", href: "/dashboard/customer" },
      { label: "Book", href: "/book" },
      { label: "Join Queue", href: "/queue/join" },
    ],
    permissions: [
      "booking:create",
      "booking:read",
      "booking:update",
      "queue:create",
      "queue:read",
      "service:read",
      "business:read",
    ],
  },
  STAFF: {
    label: "Staff",
    description: "Manage queue and bookings",
    dashboardPath: "/dashboard/staff",
    navItems: [
      { label: "Queue", href: "/queue" },
      { label: "Book", href: "/book" },
    ],
    permissions: [
      "booking:create",
      "booking:read",
      "booking:update",
      "queue:create",
      "queue:read",
      "service:read",
      "business:read",
    ],
  },
  BUSINESS_OWNER: {
    label: "Business Owner",
    description: "Manage your business",
    dashboardPath: "/dashboard/owner",
    navItems: [
      { label: "Dashboard", href: "/dashboard/owner" },
      { label: "Services", href: "/dashboard/owner/services" },
      { label: "Settings", href: "/dashboard/owner/settings" },
    ],
    permissions: [
      "booking:create",
      "booking:read",
      "booking:update",
      "queue:create",
      "queue:read",
      "queue:manage",
      "service:create",
      "service:read",
      "service:update",
      "service:delete",
      "business:read",
      "business:update",
      "staff:read",
      "staff:update",
    ],
  },
  ADMIN: {
    label: "Admin",
    description: "Full platform control",
    dashboardPath: "/admin",
    navItems: [
      { label: "Dashboard", href: "/admin" },
      { label: "Businesses", href: "/admin/businesses" },
      { label: "Users", href: "/admin/users" },
    ],
    permissions: [
      "booking:create",
      "booking:read",
      "booking:update",
      "booking:delete",
      "queue:create",
      "queue:read",
      "queue:manage",
      "service:create",
      "service:read",
      "service:update",
      "service:delete",
      "business:create",
      "business:read",
      "business:update",
      "business:delete",
      "business:manage",
      "staff:create",
      "staff:read",
      "staff:update",
      "staff:delete",
      "user:create",
      "user:read",
      "user:update",
      "user:delete",
      "user:manage",
      "admin:read",
      "admin:manage",
    ],
  },
}

export function getRoleConfig(role: Role): RoleConfig {
  return roleConfigs[role] || roleConfigs.CUSTOMER
}

export function hasPermission(role: Role, permission: Permission): boolean {
  const config = getRoleConfig(role)
  return config.permissions.includes(permission)
}

export function canAccess(role: Role, resource: Resource, action: Action): boolean {
  return hasPermission(role, `${resource}:${action}`)
}

export function getDashboardPath(role: Role): string {
  return getRoleConfig(role).dashboardPath
}

export function getNavItems(role: Role | null): { label: string; href: string }[] {
  if (!role) return []
  return getRoleConfig(role).navItems
}

export function isAdmin(role: Role | null): boolean {
  return role === "ADMIN"
}

export function isBusinessOwner(role: Role | null): boolean {
  return role === "BUSINESS_OWNER" || role === "ADMIN"
}

export function isStaff(role: Role | null): boolean {
  return role === "STAFF" || role === "BUSINESS_OWNER" || role === "ADMIN"
}

export async function requirePermission(
  session: { user: { role: Role; id: string } } | null,
  permission: Permission
): Promise<{ allowed: boolean; error?: string }> {
  if (!session?.user) {
    return { allowed: false, error: "Unauthorized" }
  }

  if (!hasPermission(session.user.role, permission)) {
    return { allowed: false, error: "Forbidden" }
  }

  return { allowed: true }
}

export async function requireRole(
  session: { user: { role: Role; id: string } } | null,
  ...roles: Role[]
): Promise<{ allowed: boolean; error?: string }> {
  if (!session?.user) {
    return { allowed: false, error: "Unauthorized" }
  }

  if (!roles.includes(session.user.role)) {
    return { allowed: false, error: "Forbidden" }
  }

  return { allowed: true }
}
