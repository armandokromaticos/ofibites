import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { IAgencyCardRepository } from "../../../domain/repositories/agency-card.repository.interface";
import { AGENCY_CARD_REPOSITORY } from "../../../domain/repositories/agency-card.repository.interface";
import { SupabaseService } from "../../../infrastructure/supabase/supabase.service";
import { AgencyCardEntity } from "../../../domain/entities/agency-card.entity";

const BUCKET = "agency-card-images";

@Injectable()
export class DeleteAgencyCardImageUseCase {
  private readonly logger = new Logger(DeleteAgencyCardImageUseCase.name);

  constructor(
    @Inject(AGENCY_CARD_REPOSITORY)
    private readonly repository: IAgencyCardRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(cardId: string): Promise<AgencyCardEntity> {
    const existing = await this.repository.findUnique({
      where: { id: cardId },
    });
    if (!existing) {
      throw new NotFoundException(`Agency card with id ${cardId} not found`);
    }

    if (!existing.imageUrl) {
      throw new BadRequestException(
        "Agency card does not have an image to delete",
      );
    }

    const currentUrl = existing.imageUrl;

    const updated = await this.repository.update({
      where: { id: cardId },
      data: { imageUrl: null },
    });

    await this.deleteFromStorage(currentUrl, cardId);

    return updated;
  }

  async deleteFromStorage(imageUrl: string, cardId: string): Promise<void> {
    try {
      const pathFromUrl = imageUrl.split("/").slice(-2).join("/");
      await this.supabaseService.deleteFile(BUCKET, pathFromUrl);
    } catch (error) {
      this.logger.warn(
        `Failed to delete image from storage for agency card ${cardId}: ${error}`,
      );
    }
  }
}
