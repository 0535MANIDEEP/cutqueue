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
  | "portfolio"
  | "business"
  | "staff"
  | "user"
  | "template"
  | "analytics"
  | "settings"
  | "admin"

export type Action = "create" | "read" | "update" | "delete" | "manage"

export type Permission = `${Resource}:${Action}`

const roleConfigs: Record<Role, RoleConfig> = {
  CUSTOMER: {
    label: "Customer",
    description: "Book services, join queues, earn rewards",
    dashboardPath: "/dashboard/customer",
    navItems: [
      { label: "Book", href: "/book" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Queue", href: "/queue" },
    ],
    permissions: [
      "booking:create",
      "booking:read",
      "booking:update",
      "queue:create",
      "queue:read",
      "service:read",
      "portfolio:read",
      "business:read",
    ],
  },
  STAFF: {
    label: "Staff",
    description: "Manage your bookings, portfolio, and schedule",
    dashboardPath: "/dashboard/staff",
    navItems: [
      { label: "Book", href: "/book" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Queue", href: "/queue" },
    ],
    permissions: [
      "booking:create",
      "booking:read",
      "booking:update",
      "queue:create",
      "queue:read",
      "service:read",
      "portfolio:create",
      "portfolio:read",
      "portfolio:update",
      "business:read",
      "analytics:read",
    ],
  },
  BUSINESS_OWNER: {
    label: "Business Owner",
    description: "Manage your business, queue, services, and staff",
    dashboardPath: "/dashboard/owner",
    navItems: [
      { label: "Book", href: "/book" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Queue", href: "/queue" },
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
      "portfolio:create",
      "portfolio:read",
      "portfolio:update",
      "portfolio:delete",
      "business:read",
      "business:update",
      "staff:read",
      "staff:update",
      "analytics:read",
      "settings:update",
    ],
  },
  ADMIN: {
    label: "Admin",
    description: "Full platform control",
    dashboardPath: "/admin",
    navItems: [
      { label: "Book", href: "/book" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Queue", href: "/queue" },
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
      "portfolio:create",
      "portfolio:read",
      "portfolio:update",
      "portfolio:delete",
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
      "template:create",
      "template:read",
      "template:update",
      "template:delete",
      "analytics:read",
      "settings:read",
      "settings:update",
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
