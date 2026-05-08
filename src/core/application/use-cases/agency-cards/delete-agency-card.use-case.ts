import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IAgencyCardRepository } from "../../../domain/repositories/agency-card.repository.interface";
import { AGENCY_CARD_REPOSITORY } from "../../../domain/repositories/agency-card.repository.interface";
import { DeleteAgencyCardImageUseCase } from "./delete-agency-card-image.use-case";

@Injectable()
export class DeleteAgencyCardUseCase {
  constructor(
    @Inject(AGENCY_CARD_REPOSITORY)
    private readonly repository: IAgencyCardRepository,
    private readonly deleteAgencyCardImageUseCase: DeleteAgencyCardImageUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    const card = await this.repository.findUnique({ where: { id } });
    if (!card) {
      throw new NotFoundException(`Agency card with id ${id} not found`);
    }

    const imageUrl = card.imageUrl;

    await this.repository.delete(id);

    if (imageUrl) {
      await this.deleteAgencyCardImageUseCase.deleteFromStorage(imageUrl, id);
    }
  }
}
