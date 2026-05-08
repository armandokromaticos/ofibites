import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IComboRepository } from "../../../domain/repositories/combo.repository.interface";
import {
  COMBO_FULL_INCLUDE,
  COMBO_REPOSITORY,
} from "../../../domain/repositories/combo.repository.interface";
import { ComboEntity } from "../../../domain/entities/combo.entity";

@Injectable()
export class GetComboUseCase {
  constructor(
    @Inject(COMBO_REPOSITORY)
    private readonly comboRepository: IComboRepository,
  ) {}

  async execute(id: string): Promise<ComboEntity> {
    const combo = await this.comboRepository.findUnique({
      where: { id },
      include: COMBO_FULL_INCLUDE,
    });
    if (!combo) {
      throw new NotFoundException(`Combo with id ${id} not found`);
    }
    return combo;
  }
}
