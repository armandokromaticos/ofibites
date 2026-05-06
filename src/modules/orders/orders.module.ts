import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CouponsModule } from "../coupons/coupons.module";
import { OrdersController } from "./controllers/orders.controller";
import { ORDER_REPOSITORY } from "../../core/domain/repositories/order.repository.interface";
import { OrderRepository } from "../../core/infrastructure/repositories/order.repository";
import { PRODUCT_REPOSITORY } from "../../core/domain/repositories/product.repository.interface";
import { ProductRepository } from "../../core/infrastructure/repositories/product.repository";
import { PRODUCT_SIZE_REPOSITORY } from "../../core/domain/repositories/product-size.repository.interface";
import { ProductSizeRepository } from "../../core/infrastructure/repositories/product-size.repository";
import { PRODUCT_MODIFIER_REPOSITORY } from "../../core/domain/repositories/product-modifier.repository.interface";
import { ProductModifierRepository } from "../../core/infrastructure/repositories/product-modifier.repository";
import { PRODUCT_MODIFIER_GROUP_REPOSITORY } from "../../core/domain/repositories/product-modifier-group.repository.interface";
import { ProductModifierGroupRepository } from "../../core/infrastructure/repositories/product-modifier-group.repository";
import { COMBO_REPOSITORY } from "../../core/domain/repositories/combo.repository.interface";
import { ComboRepository } from "../../core/infrastructure/repositories/combo.repository";
import { BRANCH_REPOSITORY } from "../../core/domain/repositories/branch.repository.interface";
import { BranchRepository } from "../../core/infrastructure/repositories/branch.repository";
import { DEPARTMENT_REPOSITORY } from "../../core/domain/repositories/department.repository.interface";
import { DepartmentRepository } from "../../core/infrastructure/repositories/department.repository";
import { COMPANY_ADDRESS_REPOSITORY } from "../../core/domain/repositories/company-address.repository.interface";
import { CompanyAddressRepository } from "../../core/infrastructure/repositories/company-address.repository";
import { CreateOrderUseCase } from "../../core/application/use-cases/orders/create-order.use-case";
import { GetOrderUseCase } from "../../core/application/use-cases/orders/get-order.use-case";
import { GetOrdersUseCase } from "../../core/application/use-cases/orders/get-orders.use-case";
import { CancelOrderUseCase } from "../../core/application/use-cases/orders/cancel-order.use-case";
import { UpdateOrderStatusUseCase } from "../../core/application/use-cases/orders/update-order-status.use-case";

@Module({
  imports: [AuthModule, CouponsModule],
  controllers: [OrdersController],
  providers: [
    { provide: ORDER_REPOSITORY, useClass: OrderRepository },
    { provide: PRODUCT_REPOSITORY, useClass: ProductRepository },
    { provide: PRODUCT_SIZE_REPOSITORY, useClass: ProductSizeRepository },
    {
      provide: PRODUCT_MODIFIER_REPOSITORY,
      useClass: ProductModifierRepository,
    },
    {
      provide: PRODUCT_MODIFIER_GROUP_REPOSITORY,
      useClass: ProductModifierGroupRepository,
    },
    { provide: COMBO_REPOSITORY, useClass: ComboRepository },
    { provide: BRANCH_REPOSITORY, useClass: BranchRepository },
    { provide: DEPARTMENT_REPOSITORY, useClass: DepartmentRepository },
    {
      provide: COMPANY_ADDRESS_REPOSITORY,
      useClass: CompanyAddressRepository,
    },
    CreateOrderUseCase,
    GetOrderUseCase,
    GetOrdersUseCase,
    CancelOrderUseCase,
    UpdateOrderStatusUseCase,
  ],
})
export class OrdersModule {}
