import { Prisma } from "@prisma/client";
import { OrderVisibilityFilter } from "../../domain/repositories/order.repository.interface";

/**
 * Traduce un filtro de visibilidad de órdenes al `where` de Prisma.
 * Compartido entre el listado de órdenes y las agregaciones de dashboard
 * para que la regla de tenant viva en un solo lugar.
 *
 * Para `byCompanies` con lista vacía devuelve `{ companyId: { in: [] } }`,
 * que no matchea ninguna fila (equivale a "sin acceso").
 */
export function buildOrderVisibilityWhere(
  visibility: OrderVisibilityFilter,
): Prisma.OrderWhereInput {
  switch (visibility.type) {
    case "all":
      return {};
    case "byCompany":
      return { companyId: visibility.companyId };
    case "byCompanies":
      return { companyId: { in: visibility.companyIds } };
    case "byUserOrCompanies": {
      const ors: Prisma.OrderWhereInput[] = [{ userId: visibility.userId }];
      if (visibility.companyIds.length > 0) {
        ors.push({ companyId: { in: visibility.companyIds } });
      }
      return { OR: ors };
    }
  }
}
