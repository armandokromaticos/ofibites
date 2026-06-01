import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { IOrderRepository } from "../../../domain/repositories/order.repository.interface";
import {
  ORDER_REPOSITORY,
  ORDER_FULL_INCLUDE,
} from "../../../domain/repositories/order.repository.interface";
import type { ICompanyRepository } from "../../../domain/repositories/company.repository.interface";
import { COMPANY_REPOSITORY } from "../../../domain/repositories/company.repository.interface";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import type { IBranchRepository } from "../../../domain/repositories/branch.repository.interface";
import { BRANCH_REPOSITORY } from "../../../domain/repositories/branch.repository.interface";
import type { IDepartmentRepository } from "../../../domain/repositories/department.repository.interface";
import { DEPARTMENT_REPOSITORY } from "../../../domain/repositories/department.repository.interface";
import type { ICompanyAddressRepository } from "../../../domain/repositories/company-address.repository.interface";
import { COMPANY_ADDRESS_REPOSITORY } from "../../../domain/repositories/company-address.repository.interface";
import type { IProductRepository } from "../../../domain/repositories/product.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../domain/repositories/product.repository.interface";
import type { IProductSizeRepository } from "../../../domain/repositories/product-size.repository.interface";
import { PRODUCT_SIZE_REPOSITORY } from "../../../domain/repositories/product-size.repository.interface";
import type { IComboRepository } from "../../../domain/repositories/combo.repository.interface";
import { COMBO_REPOSITORY } from "../../../domain/repositories/combo.repository.interface";
import {
  OrderEntity,
  CreateOrderItemParams,
} from "../../../domain/entities/order.entity";
import { Role } from "../../../domain/enums/role.enum";
import { LineItemPricingService } from "../../services/line-item-pricing.service";
import { assertCompanyActive } from "../../shared/company-active.guard";
import { RepeatOrderDto } from "../../dto/orders/repeat-order.dto";
import { RepeatOrderOmissionReason } from "../../dto/orders/repeat-order-response.dto";

const PLATFORM_BYPASS_MEMBERSHIP_ROLES: ReadonlySet<Role> = new Set([
  Role.SUPER_ADMIN,
  Role.OPS_ADMIN,
]);

export interface SkippedOrderItem {
  productId: string;
  comboId: string | null;
  reason: RepeatOrderOmissionReason;
}

export interface RepeatOrderResult {
  order: OrderEntity;
  skippedItems: SkippedOrderItem[];
}

@Injectable()
export class RepeatOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: IDepartmentRepository,
    @Inject(COMPANY_ADDRESS_REPOSITORY)
    private readonly companyAddressRepository: ICompanyAddressRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_SIZE_REPOSITORY)
    private readonly productSizeRepository: IProductSizeRepository,
    @Inject(COMBO_REPOSITORY)
    private readonly comboRepository: IComboRepository,
    private readonly lineItemPricingService: LineItemPricingService,
  ) {}

  async execute(
    orderId: string,
    userId: string,
    userRole: Role,
    dto: RepeatOrderDto,
  ): Promise<RepeatOrderResult> {
    const original = await this.orderRepository.findUnique({
      where: { id: orderId },
      include: ORDER_FULL_INCLUDE,
    });
    if (!original) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const companyId = original.companyId;

    if (!PLATFORM_BYPASS_MEMBERSHIP_ROLES.has(userRole)) {
      const membership =
        await this.companyMemberRepository.findActiveByUserAndCompany(
          userId,
          companyId,
        );
      if (!membership) {
        throw new ForbiddenException("No perteneces a esta empresa");
      }
    }

    await assertCompanyActive(companyId, {
      companyRepository: this.companyRepository,
    });

    const deliveryAddressId =
      dto.deliveryAddressId ?? original.deliveryAddressId;
    const branchId = dto.branchId ?? original.branchId ?? null;
    const departmentId = dto.departmentId ?? original.departmentId ?? null;

    await this.assertAddress(
      deliveryAddressId,
      companyId,
      dto.deliveryAddressId !== undefined,
    );
    await this.assertBranch(branchId, companyId);
    await this.assertDepartment(departmentId, companyId);

    const { items, skippedItems } = await this.resolveItems(original);
    if (items.length === 0) {
      throw new BadRequestException(
        "Ningún producto del pedido original sigue disponible para repetir.",
      );
    }

    const subtotal =
      Math.round(items.reduce((sum, item) => sum + item.subtotal, 0) * 100) /
      100;

    const entity = OrderEntity.fromCreateDto({
      userId,
      companyId,
      createdById: userId,
      deliveryAddressId,
      branchId: branchId ?? undefined,
      departmentId: departmentId ?? undefined,
      deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
      deliveryTime: dto.deliveryTime,
      notes: dto.notes ?? original.notes ?? undefined,
      priority: dto.priority ?? original.priority,
      subtotal,
      discount: 0,
      total: subtotal,
      items,
    });

    const order = await this.orderRepository.create(entity);
    return { order, skippedItems };
  }

  /** Re-precia los ítems disponibles y reporta los omitidos. */
  private async resolveItems(original: OrderEntity): Promise<{
    items: CreateOrderItemParams[];
    skippedItems: SkippedOrderItem[];
  }> {
    const items: CreateOrderItemParams[] = [];
    const skippedItems: SkippedOrderItem[] = [];

    for (const item of original.items ?? []) {
      const reason = await this.unavailableReason(item);
      if (reason) {
        skippedItems.push({
          productId: item.productId,
          comboId: item.comboId,
          reason,
        });
        continue;
      }

      try {
        const priced = await this.lineItemPricingService.priceLineItem({
          productId: item.productId,
          productSizeId: item.productSizeId,
          comboId: item.comboId,
          quantity: item.quantity,
          modifiers: item.modifiers.map((modifier) => ({
            modifierId: modifier.modifierId,
          })),
        });
        items.push({
          productId: item.productId,
          productSizeId: item.productSizeId ?? undefined,
          comboId: item.comboId ?? undefined,
          quantity: item.quantity,
          unitPrice: priced.unitPrice,
          subtotal: priced.subtotal,
          modifiers: priced.modifiers,
        });
      } catch (err) {
        // Solo se omite si la línea ya no es válida (entidad borrada / no aplica);
        // un error inesperado (p. ej. DB) se propaga.
        if (
          !(err instanceof NotFoundException) &&
          !(err instanceof BadRequestException)
        ) {
          throw err;
        }
        skippedItems.push({
          productId: item.productId,
          comboId: item.comboId,
          reason: RepeatOrderOmissionReason.PRICING_FAILED,
        });
      }
    }

    return { items, skippedItems };
  }

  /** Producto/size/combo borrado o inactivo. `null` si el ítem está disponible. */
  private async unavailableReason(item: {
    productId: string;
    productSizeId: string | null;
    comboId: string | null;
  }): Promise<RepeatOrderOmissionReason | null> {
    // priceLineItem siempre exige que el producto exista (los combos lo usan como
    // ancla), así que se valida primero. comboId y productSizeId son mutuamente
    // excluyentes (lo enforza priceLineItem).
    const product = await this.productRepository.findUnique({
      where: { id: item.productId },
    });
    if (!product) return RepeatOrderOmissionReason.PRODUCT_NOT_FOUND;

    if (item.comboId) {
      // Un combo se gobierna por su propio isActive, no por el del producto ancla.
      const combo = await this.comboRepository.findUnique({
        where: { id: item.comboId },
      });
      if (!combo) return RepeatOrderOmissionReason.COMBO_NOT_FOUND;
      if (!combo.isActive) return RepeatOrderOmissionReason.COMBO_INACTIVE;
      return null;
    }

    if (!product.isActive) return RepeatOrderOmissionReason.PRODUCT_INACTIVE;

    if (item.productSizeId) {
      const size = await this.productSizeRepository.findUnique({
        where: { id: item.productSizeId },
      });
      if (!size) return RepeatOrderOmissionReason.SIZE_NOT_FOUND;
      if (!size.isActive) return RepeatOrderOmissionReason.SIZE_INACTIVE;
    }

    return null;
  }

  private async assertAddress(
    addressId: string,
    companyId: string,
    overridden: boolean,
  ): Promise<void> {
    const address = await this.companyAddressRepository.findUnique({
      where: { id: addressId },
    });
    if (!address || address.companyId !== companyId) {
      throw new BadRequestException(
        overridden
          ? `Delivery address ${addressId} no encontrada o no pertenece a la empresa`
          : "La dirección del pedido original ya no está disponible; indica una nueva en deliveryAddressId.",
      );
    }
  }

  private async assertBranch(
    branchId: string | null,
    companyId: string,
  ): Promise<void> {
    if (!branchId) return;
    const branch = await this.branchRepository.findUnique({
      where: { id: branchId },
    });
    if (!branch || branch.companyId !== companyId) {
      throw new BadRequestException(
        `Branch ${branchId} no encontrada o no pertenece a la empresa; envía branchId válido u omítela.`,
      );
    }
  }

  private async assertDepartment(
    departmentId: string | null,
    companyId: string,
  ): Promise<void> {
    if (!departmentId) return;
    const department = await this.departmentRepository.findUnique({
      where: { id: departmentId },
    });
    if (!department || department.companyId !== companyId) {
      throw new BadRequestException(
        `Department ${departmentId} no encontrado o no pertenece a la empresa; envía departmentId válido u omítelo.`,
      );
    }
  }
}
