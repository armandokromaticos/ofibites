import type { IProductRepository } from "../../../domain/repositories/product.repository.interface";
import type { IProductSizeRepository } from "../../../domain/repositories/product-size.repository.interface";

export async function recalculateProductStock(
  productId: string,
  productSizeRepository: IProductSizeRepository,
  productRepository: IProductRepository,
): Promise<void> {
  const { data: sizes } = await productSizeRepository.findMany({
    where: { productId },
  });
  const activeSizesWithStock = sizes.filter(
    (size) => size.isActive && size.stock !== null,
  );

  const stock =
    activeSizesWithStock.length === 0
      ? null
      : activeSizesWithStock.reduce((sum, size) => sum + size.stock!, 0);

  await productRepository.update({
    where: { id: productId },
    data: { stock },
  });
}
