import { MoodGallery as PrismaMoodGallery, Prisma } from "@prisma/client";
import { MoodGalleryResponseDto } from "../../application/dto/mood-gallery/mood-gallery-response.dto";

interface MoodGalleryProps {
  id: string | undefined;
  title: string | null;
  imageUrl: string | null;
  imageMobileUrl: string | null;
  altEs: string;
  altEn: string;
  section: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMoodGalleryParams {
  title?: string;
  imageUrl?: string;
  imageMobileUrl?: string;
  altEs: string;
  altEn: string;
  section?: string;
  order?: number;
  isActive?: boolean;
}

export class MoodGalleryEntity {
  private props: MoodGalleryProps;

  constructor(props: MoodGalleryProps) {
    this.props = props;
  }

  get id(): string | undefined {
    return this.props.id;
  }
  get title(): string | null {
    return this.props.title;
  }
  get imageUrl(): string | null {
    return this.props.imageUrl;
  }
  get imageMobileUrl(): string | null {
    return this.props.imageMobileUrl;
  }
  get altEs(): string {
    return this.props.altEs;
  }
  get altEn(): string {
    return this.props.altEn;
  }
  get section(): string | null {
    return this.props.section;
  }
  get order(): number {
    return this.props.order;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static fromCreateDto(params: CreateMoodGalleryParams): MoodGalleryEntity {
    return new MoodGalleryEntity({
      id: undefined,
      title: params.title ?? null,
      imageUrl: params.imageUrl ?? null,
      imageMobileUrl: params.imageMobileUrl ?? null,
      altEs: params.altEs,
      altEn: params.altEn,
      section: params.section ?? "mood-carousel",
      order: params.order ?? 0,
      isActive: params.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPrisma(prisma: PrismaMoodGallery): MoodGalleryEntity {
    return new MoodGalleryEntity({
      id: prisma.id,
      title: prisma.title,
      imageUrl: prisma.imageUrl,
      imageMobileUrl: prisma.imageMobileUrl,
      altEs: prisma.altEs,
      altEn: prisma.altEn,
      section: prisma.section,
      order: prisma.order,
      isActive: prisma.isActive,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  toPrismaCreate(): Prisma.MoodGalleryCreateInput {
    return {
      title: this.props.title,
      imageUrl: this.props.imageUrl,
      imageMobileUrl: this.props.imageMobileUrl,
      altEs: this.props.altEs,
      altEn: this.props.altEn,
      section: this.props.section,
      order: this.props.order,
      isActive: this.props.isActive,
    };
  }

  toResponseDto(): MoodGalleryResponseDto {
    if (!this.props.id) {
      throw new Error("Cannot convert unpersisted entity to response DTO");
    }
    const dto = new MoodGalleryResponseDto();
    dto.id = this.props.id;
    dto.title = this.props.title;
    dto.imageUrl = this.props.imageUrl;
    dto.imageMobileUrl = this.props.imageMobileUrl;
    dto.altEs = this.props.altEs;
    dto.altEn = this.props.altEn;
    dto.section = this.props.section;
    dto.order = this.props.order;
    dto.isActive = this.props.isActive;
    dto.createdAt = this.props.createdAt;
    dto.updatedAt = this.props.updatedAt;
    return dto;
  }
}
