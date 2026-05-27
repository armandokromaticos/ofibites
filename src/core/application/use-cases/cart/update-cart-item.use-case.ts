import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ICartRepository } from "../../../domain/repositories/cart.repository.interface";
import { CART_REPOSITORY } from "../../../domain/repositories/cart.repository.interface";
import { CartViewService } from "../../services/cart-view.service";
import { UpdateCartItemDto } from "../../dto/cart/update-cart-item.dto";
import { CartResponseDto } from "../../dto/cart/cart-response.dto";

@Injectable()
export class UpdateCartItemUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    private readonly cartView: CartViewService,
  ) {}

  async execute(
    companyId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.cartRepository.getOrCreateByCompanyId(companyId);
    const item = cart.items.find((cartItem) => cartItem.id === itemId);
    if (!item) {
      throw new NotFoundException(
        `Cart item ${itemId} not found in this company's cart`,
      );
    }

    await this.cartRepository.updateItemQuantity(itemId, dto.quantity);
    return this.cartView.build(companyId);
  }
}
