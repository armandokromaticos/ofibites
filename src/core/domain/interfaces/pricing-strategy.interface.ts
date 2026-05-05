import { Money } from "../value-objects/money.vo";

export interface PricingContext {
  userId?: string;
  sizeId?: string;
  modifierIds?: string[];
}

export interface PricingStrategy {
  getProductPrice(productId: string, context: PricingContext): Promise<Money>;
}

export const PRICING_STRATEGY = Symbol("PRICING_STRATEGY");
