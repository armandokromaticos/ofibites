import { Injectable } from "@nestjs/common";
import { CartViewService } from "../../services/cart-view.service";
import { CartResponseDto } from "../../dto/cart/cart-response.dto";

@Injectable()
export class GetCartUseCase {
  constructor(private readonly cartView: CartViewService) {}

  async execute(companyId: string): Promise<CartResponseDto> {
    return this.cartView.build(companyId);
  }
}
