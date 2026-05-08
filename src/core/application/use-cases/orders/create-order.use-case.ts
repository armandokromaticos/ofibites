import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { IOrderRepository } from "../../../domain/repositories/order.repository.interface";
import { ORDER_REPOSITORY } from "../../../domain/repositories/order.repository.interface";
import type { IProductRepository } from "../../../domain/repositories/product.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../domain/repositories/product.repository.interface";
import type { IProductSizeRepository } from "../../../domain/repositories/product-size.repository.interface";
import { PRODUCT_SIZE_REPOSITORY } from "../../../domain/repositories/product-size.repository.interface";
import type { IProductModifierRepository } from "../../../domain/repositories/product-modifier.repository.interface";
import { PRODUCT_MODIFIER_REPOSITORY } from "../../../domain/repositories/product-modifier.repository.interface";
import type { IProductModifierGroupRepository } from "../../../domain/repositories/product-modifier-group.repository.interface";
import { PRODUCT_MODIFIER_GROUP_REPOSITORY } from "../../../domain/repositories/product-modifier-group.repository.interface";
import type { IComboRepository } from "../../../domain/repositories/combo.repository.interface";
import { COMBO_REPOSITORY } from "../../../domain/repositories/combo.repository.interface";
import type { ICouponRepository } from "../../../domain/repositories/coupon.repository.interface";
import { COUPON_REPOSITORY } from "../../../domain/repositories/coupon.repository.interface";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import type { IBranchRepository } from "../../../domain/repositories/branch.repository.interface";
import { BRANCH_REPOSITORY } from "../../../domain/repositories/branch.repository.interface";
import type { IDepartmentRepository } from "../../../domain/repositories/department.repository.interface";
import { DEPARTMENT_REPOSITORY } from "../../../domain/repositories/department.repository.interface";
import type { ICompanyAddressRepository } from "../../../domain/repositories/company-address.repository.interface";
import { COMPANY_ADDRESS_REPOSITORY } from "../../../domain/repositories/company-address.repository.interface";
import { CreateOrderDto } from "../../dto/orders/create-order.dto";
import {
  OrderEntity,
  CreateOrderItemParams,
  CreateOrderItemModifierParams,
} from "../../../domain/entities/order.entity";
import { CouponEntity } from "../../../domain/entities/coupon.entity";
import { Role } from "../../../domain/enums/role.enum";

const PLATFORM_BYPASS_MEMBERSHIP_ROLES: ReadonlySet<Role> = new Set([
  Role.SUPER_ADMIN,
  Role.OPS_ADMIN,
  Role.FINANCE_ADMIN,
]);

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_SIZE_REPOSITORY)
    private readonly productSizeRepository: IProductSizeRepository,
    @Inject(PRODUCT_MODIFIER_REPOSITORY)
    private readonly productModifierRepository: IProductModifierRepository,
    @Inject(PRODUCT_MODIFIER_GROUP_REPOSITORY)
    private readonly productModifierGroupRepository: IProductModifierGroupRepository,
    @Inject(COMBO_REPOSITORY)
    private readonly comboRepository: IComboRepository,
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: IDepartmentRepository,
    @Inject(COMPANY_ADDRESS_REPOSITORY)
    private readonly companyAddressRepository: ICompanyAddressRepository,
  ) {}

  async execute(
    userId: string,
    userRole: Role,
    dto: CreateOrderDto,
  ): Promise<OrderEntity> {
    await this.validateCompanyContext(userId, userRole, dto);

    const items: CreateOrderItemParams[] = [];

    for (const itemDto of dto.items) {
      const product = await this.productRepository.findUnique({
        where: { id: itemDto.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with id ${itemDto.productId} not found`,
        );
      }

      let unitPrice: number;

      if (itemDto.comboId) {
        const combo = await this.comboRepository.findUnique({
          where: { id: itemDto.comboId },
        });
        if (!combo) {
          throw new NotFoundException(
            `Combo with id ${itemDto.comboId} not found`,
          );
        }
        unitPrice = combo.price;
      } else if (itemDto.productSizeId) {
        const size = await this.productSizeRepository.findUnique({
          where: { id: itemDto.productSizeId },
        });
        if (!size) {
          throw new NotFoundException(
            `ProductSize with id ${itemDto.productSizeId} not found`,
          );
        }
        if (size.productId !== itemDto.productId) {
          throw new BadRequestException(
            `ProductSize ${itemDto.productSizeId} does not belong to product ${itemDto.productId}`,
          );
        }
        unitPrice = size.price;
      } else {
        unitPrice = product.basePrice;
      }

      const modifiers: CreateOrderItemModifierParams[] = [];
      let modifierTotal = 0;

      if (itemDto.modifiers && itemDto.modifiers.length > 0) {
        const modifierIds = itemDto.modifiers.map((m) => m.modifierId);
        const sizePricesMap = itemDto.productSizeId
          ? await this.productModifierRepository.findSizePricesBatch(
              modifierIds,
              itemDto.productSizeId,
            )
          : new Map<string, number>();

        for (const modDto of itemDto.modifiers) {
          const modifier = await this.productModifierRepository.findUnique({
            where: { id: modDto.modifierId },
          });
          if (!modifier) {
            throw new NotFoundException(
              `ProductModifier with id ${modDto.modifierId} not found`,
            );
          }
          const group = await this.productModifierGroupRepository.findUnique({
            where: { id: modifier.groupId },
          });
          if (!group || group.productId !== itemDto.productId) {
            throw new BadRequestException(
              `ProductModifier ${modDto.modifierId} does not belong to product ${itemDto.productId}`,
            );
          }
          if (modifier.sizeRestricted && itemDto.productSizeId) {
            if (!sizePricesMap.has(modDto.modifierId)) {
              throw new BadRequestException(
                `Modifier ${modDto.modifierId} is not available for the selected size`,
              );
            }
          }
          const adj =
            sizePricesMap.get(modDto.modifierId) ?? modifier.priceAdjustment;
          modifierTotal += adj;
          modifiers.push({
            modifierId: modDto.modifierId,
            priceAdjustment: adj,
          });
        }
      }

      const subtotal =
        Math.round((unitPrice + modifierTotal) * itemDto.quantity * 100) / 100;

      items.push({
        productId: itemDto.productId,
        productSizeId: itemDto.productSizeId,
        comboId: itemDto.comboId,
        quantity: itemDto.quantity,
        unitPrice,
        subtotal,
        modifiers,
      });
    }

    const subtotal =
      Math.round(items.reduce((sum, item) => sum + item.subtotal, 0) * 100) /
      100;

    let coupon: CouponEntity | null = null;
    let discount = 0;

    if (dto.couponCode) {
      coupon = await this.couponRepository.findByName(
        dto.couponCode.toUpperCase(),
      );
      if (!coupon) {
        throw new BadRequestException(`Coupon "${dto.couponCode}" not found`);
      }
      if (!coupon.isValid()) {
        throw new BadRequestException(
          "Coupon is not valid (inactive, expired, or no uses remaining)",
        );
      }
      if (coupon.hasBeenUsedByUser(userId)) {
        throw new BadRequestException("You have already used this coupon");
      }
      discount = coupon.calculateDiscount(subtotal);
    }

    const total = Math.round((subtotal - discount) * 100) / 100;

    const entity = OrderEntity.fromCreateDto({
      userId,
      couponId: coupon?.id,
      companyId: dto.companyId,
      branchId: dto.branchId,
      departmentId: dto.departmentId,
      createdById: userId,
      deliveryAddressId: dto.deliveryAddressId,
      deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
      deliveryTime: dto.deliveryTime,
      notes: dto.notes,
      priority: dto.priority,
      subtotal,
      discount,
      total,
      items,
    });
    const createdOrder = await this.orderRepository.create(entity);

    if (coupon && coupon.id && createdOrder.id) {
      await this.couponRepository.consumeCoupon(
        coupon.id,
        userId,
        createdOrder.id,
      );
    }

    return createdOrder;
  }

  private async validateCompanyContext(
    userId: string,
    userRole: Role,
    dto: CreateOrderDto,
  ): Promise<void> {
    if (!PLATFORM_BYPASS_MEMBERSHIP_ROLES.has(userRole)) {
      const membership =
        await this.companyMemberRepository.findActiveByUserAndCompany(
          userId,
          dto.companyId,
        );
      if (!membership) {
        throw new ForbiddenException("No perteneces a esta empresa");
      }
    }

    const address = await this.companyAddressRepository.findUnique({
      where: { id: dto.deliveryAddressId },
    });
    if (!address) {
      throw new NotFoundException(
        `Delivery address ${dto.deliveryAddressId} not found`,
      );
    }
    if (address.companyId !== dto.companyId) {
      throw new BadRequestException(
        `Delivery address ${dto.deliveryAddressId} does not belong to company ${dto.companyId}`,
      );
    }

    if (dto.branchId) {
      const branch = await this.branchRepository.findUnique({
        where: { id: dto.branchId },
      });
      if (!branch) {
        throw new NotFoundException(`Branch ${dto.branchId} not found`);
      }
      if (branch.companyId !== dto.companyId) {
        throw new BadRequestException(
          `Branch ${dto.branchId} does not belong to company ${dto.companyId}`,
        );
      }
    }

    if (dto.departmentId) {
      const department = await this.departmentRepository.findUnique({
        where: { id: dto.departmentId },
      });
      if (!department) {
        throw new NotFoundException(`Department ${dto.departmentId} not found`);
      }
      if (department.companyId !== dto.companyId) {
        throw new BadRequestException(
          `Department ${dto.departmentId} does not belong to company ${dto.companyId}`,
        );
      }
    }
  }
}
