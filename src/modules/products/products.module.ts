import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ProductsController } from "./controllers/products.controller";

// Repository symbols
import { PRODUCT_REPOSITORY } from "../../core/domain/repositories/product.repository.interface";
import { PRODUCT_SIZE_REPOSITORY } from "../../core/domain/repositories/product-size.repository.interface";
import { PRODUCT_MODIFIER_GROUP_REPOSITORY } from "../../core/domain/repositories/product-modifier-group.repository.interface";
import { PRODUCT_MODIFIER_REPOSITORY } from "../../core/domain/repositories/product-modifier.repository.interface";

// Repository implementations
import { ProductRepository } from "../../core/infrastructure/repositories/product.repository";
import { ProductSizeRepository } from "../../core/infrastructure/repositories/product-size.repository";
import { ProductModifierGroupRepository } from "../../core/infrastructure/repositories/product-modifier-group.repository";
import { ProductModifierRepository } from "../../core/infrastructure/repositories/product-modifier.repository";

// Use Cases - Products
import { CreateProductUseCase } from "../../core/application/use-cases/products/create-product.use-case";
import { GetProductUseCase } from "../../core/application/use-cases/products/get-product.use-case";
import { GetProductsUseCase } from "../../core/application/use-cases/products/get-products.use-case";
import { UpdateProductUseCase } from "../../core/application/use-cases/products/update-product.use-case";
import { DeleteProductUseCase } from "../../core/application/use-cases/products/delete-product.use-case";
import { UploadProductImageUseCase } from "../../core/application/use-cases/products/upload-product-image.use-case";
import { AssignTagsToProductUseCase } from "../../core/application/use-cases/products/assign-tags-to-product.use-case";
import { RemoveTagFromProductUseCase } from "../../core/application/use-cases/products/remove-tag-from-product.use-case";

// Use Cases - Sizes
import { CreateProductSizeUseCase } from "../../core/application/use-cases/product-sizes/create-product-size.use-case";
import { GetProductSizesUseCase } from "../../core/application/use-cases/product-sizes/get-product-sizes.use-case";
import { UpdateProductSizeUseCase } from "../../core/application/use-cases/product-sizes/update-product-size.use-case";
import { DeleteProductSizeUseCase } from "../../core/application/use-cases/product-sizes/delete-product-size.use-case";

// Use Cases - Modifier Groups
import { CreateProductModifierGroupUseCase } from "../../core/application/use-cases/product-modifier-groups/create-product-modifier-group.use-case";
import { GetProductModifierGroupsUseCase } from "../../core/application/use-cases/product-modifier-groups/get-product-modifier-groups.use-case";
import { UpdateProductModifierGroupUseCase } from "../../core/application/use-cases/product-modifier-groups/update-product-modifier-group.use-case";
import { DeleteProductModifierGroupUseCase } from "../../core/application/use-cases/product-modifier-groups/delete-product-modifier-group.use-case";

// Use Cases - Modifiers
import { CreateProductModifierUseCase } from "../../core/application/use-cases/product-modifiers/create-product-modifier.use-case";
import { GetProductModifiersUseCase } from "../../core/application/use-cases/product-modifiers/get-product-modifiers.use-case";
import { UpdateProductModifierUseCase } from "../../core/application/use-cases/product-modifiers/update-product-modifier.use-case";
import { DeleteProductModifierUseCase } from "../../core/application/use-cases/product-modifiers/delete-product-modifier.use-case";
import { AssignTagsToModifierUseCase } from "../../core/application/use-cases/product-modifiers/assign-tags-to-modifier.use-case";
import { RemoveTagFromModifierUseCase } from "../../core/application/use-cases/product-modifiers/remove-tag-from-modifier.use-case";
import { SetModifierSizePricesUseCase } from "../../core/application/use-cases/product-modifiers/set-modifier-size-prices.use-case";

@Module({
  imports: [AuthModule],
  controllers: [ProductsController],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: ProductRepository },
    { provide: PRODUCT_SIZE_REPOSITORY, useClass: ProductSizeRepository },
    {
      provide: PRODUCT_MODIFIER_GROUP_REPOSITORY,
      useClass: ProductModifierGroupRepository,
    },
    {
      provide: PRODUCT_MODIFIER_REPOSITORY,
      useClass: ProductModifierRepository,
    },
    CreateProductUseCase,
    GetProductUseCase,
    GetProductsUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    UploadProductImageUseCase,
    CreateProductSizeUseCase,
    GetProductSizesUseCase,
    UpdateProductSizeUseCase,
    DeleteProductSizeUseCase,
    CreateProductModifierGroupUseCase,
    GetProductModifierGroupsUseCase,
    UpdateProductModifierGroupUseCase,
    DeleteProductModifierGroupUseCase,
    CreateProductModifierUseCase,
    GetProductModifiersUseCase,
    UpdateProductModifierUseCase,
    DeleteProductModifierUseCase,
    AssignTagsToModifierUseCase,
    RemoveTagFromModifierUseCase,
    SetModifierSizePricesUseCase,
    AssignTagsToProductUseCase,
    RemoveTagFromProductUseCase,
  ],
})
export class ProductsModule {}
