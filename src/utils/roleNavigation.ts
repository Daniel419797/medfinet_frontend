import type { OrganizationRole } from "../services/medfinetSessionApi";

export function roleHomePath(role?: OrganizationRole): string {
  switch (role) {
    case "OWNER":
    case "ADMIN":
      return "/admin/dashboard";
    case "HEALTH_WORKER":
    case "NUTRITION_WORKER":
    case "EMERGENCY_COORDINATOR":
      return "/health-worker/dashboard";
    case "MERCHANT":
      return "/merchant";
    case "AUDITOR":
      return "/audit";
    case "CAREGIVER":
    default:
      return "/dashboard";
  }
}
