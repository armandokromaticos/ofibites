import { Prisma } from "@prisma/client";

/**
 * Extrae los campos que dispararon una violación P2002 (unique constraint)
 * desde error.meta?.target. Útil para construir mensajes de conflicto
 * dinámicos sin asumir cuál es el campo único.
 */
export function describeUniqueTarget(
  error: Prisma.PrismaClientKnownRequestError,
): string {
  const target = error.meta?.target;
  if (Array.isArray(target) && target.length > 0) {
    return target.join(", ");
  }
  if (typeof target === "string" && target.length > 0) {
    return target;
  }
  return "campo único";
}
