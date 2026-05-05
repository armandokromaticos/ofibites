import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Role } from "../../../core/domain/enums/role.enum";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "./roles.decorator";

export function AdminOnly(...roles: Role[]): MethodDecorator & ClassDecorator {
  const allowed = roles.length > 0 ? roles : [Role.SUPER_ADMIN];
  return applyDecorators(
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...allowed),
  );
}
