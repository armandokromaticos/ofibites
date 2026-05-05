import { Inject, Injectable } from "@nestjs/common";
import type { IComboRepository } from "../../../domain/repositories/combo.repository.interface";
import {
  COMBO_FULL_INCLUDE,
  COMBO_REPOSITORY,
} from "../../../domain/repositories/combo.repository.interface";
import { ComboEntity } from "../../../domain/entities/combo.entity";

@Injectable()
export class GetCombosUseCase {
  constructor(
    @Inject(COMBO_REPOSITORY)
    private readonly comboRepository: IComboRepository,
  ) {}

  async execute(): Promise<ComboEntity[]> {
    const { data } = await this.comboRepository.findMany({
      include: COMBO_FULL_INCLUDE,
    });
    return data;
  }
}
