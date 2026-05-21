import { Role } from "../../domain/enums/role.enum";

export const PLATFORM_FULL_ACCESS_ROLES: ReadonlySet<Role> = new Set([
  Role.SUPER_ADMIN,
  Role.OPS_ADMIN,
]);

export const PLATFORM_ORDER_READ_ROLES: ReadonlySet<Role> = new Set([
  Role.SUPER_ADMIN,
  Role.OPS_ADMIN,
  Role.OPERATOR,
]);
