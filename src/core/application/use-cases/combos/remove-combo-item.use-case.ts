import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IComboRepository } from "../../../domain/repositories/combo.repository.interface";
import {
  COMBO_FULL_INCLUDE,
  COMBO_REPOSITORY,
} from "../../../domain/repositories/combo.repository.interface";
import { ComboEntity } from "../../../domain/entities/combo.entity";

@Injectable()
export class RemoveComboItemUseCase {
  constructor(
    @Inject(COMBO_REPOSITORY)
    private readonly comboRepository: IComboRepository,
  ) {}

  async execute(comboId: string, itemId: string): Promise<ComboEntity> {
    const combo = await this.comboRepository.findUnique({
      where: { id: comboId },
      include: COMBO_FULL_INCLUDE,
    });
    if (!combo) {
      throw new NotFoundException(`Combo with id ${comboId} not found`);
    }

    const itemExists = combo.items?.some((item) => item.id === itemId);
    if (!itemExists) {
      throw new NotFoundException(
        `Item with id ${itemId} not found in combo ${comboId}`,
      );
    }

    return this.comboRepository.removeItem(comboId, itemId);
  }
}
