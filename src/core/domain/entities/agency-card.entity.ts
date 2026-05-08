import { AgencyCard as PrismaAgencyCard, Prisma } from "@prisma/client";
import { AgencyCardResponseDto } from "../../application/dto/agency-cards/agency-card-response.dto";

interface AgencyCardProps {
  id: string | undefined;
  title: string;
  imageUrl: string | null;
  location: string;
  lodgingType: string;
  distance: string | null;
  email: string | null;
  phone: string | null;
  socialHandle: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAgencyCardParams {
  title: string;
  imageUrl?: string;
  location: string;
  lodgingType: string;
  distance?: string;
  email?: string;
  phone?: string;
  socialHandle?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  order: number;
  isActive: boolean;
}

export class AgencyCardEntity {
  private props: AgencyCardProps;

  constructor(props: AgencyCardProps) {
    this.props = props;
  }

  get id(): string | undefined {
    return this.props.id;
  }
  get title(): string {
    return this.props.title;
  }
  get imageUrl(): string | null {
    return this.props.imageUrl;
  }
  get location(): string {
    return this.props.location;
  }
  get lodgingType(): string {
    return this.props.lodgingType;
  }
  get distance(): string | null {
    return this.props.distance;
  }
  get email(): string | null {
    return this.props.email;
  }
  get phone(): string | null {
    return this.props.phone;
  }
  get socialHandle(): string | null {
    return this.props.socialHandle;
  }
  get facebookUrl(): string | null {
    return this.props.facebookUrl;
  }
  get instagramUrl(): string | null {
    return this.props.instagramUrl;
  }
  get tiktokUrl(): string | null {
    return this.props.tiktokUrl;
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

  static fromCreateDto(params: CreateAgencyCardParams): AgencyCardEntity {
    return new AgencyCardEntity({
      id: undefined,
      title: params.title,
      imageUrl: params.imageUrl ?? null,
      location: params.location,
      lodgingType: params.lodgingType,
      distance: params.distance ?? null,
      email: params.email ?? null,
      phone: params.phone ?? null,
      socialHandle: params.socialHandle ?? null,
      facebookUrl: params.facebookUrl ?? null,
      instagramUrl: params.instagramUrl ?? null,
      tiktokUrl: params.tiktokUrl ?? null,
      order: params.order,
      isActive: params.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPrisma(prisma: PrismaAgencyCard): AgencyCardEntity {
    return new AgencyCardEntity({
      id: prisma.id,
      title: prisma.title,
      imageUrl: prisma.imageUrl,
      location: prisma.location,
      lodgingType: prisma.lodgingType,
      distance: prisma.distance,
      email: prisma.email,
      phone: prisma.phone,
      socialHandle: prisma.socialHandle,
      facebookUrl: prisma.facebookUrl,
      instagramUrl: prisma.instagramUrl,
      tiktokUrl: prisma.tiktokUrl,
      order: prisma.order,
      isActive: prisma.isActive,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  toPrismaCreate(): Prisma.AgencyCardCreateInput {
    return {
      title: this.props.title,
      imageUrl: this.props.imageUrl,
      location: this.props.location,
      lodgingType: this.props.lodgingType,
      distance: this.props.distance,
      email: this.props.email,
      phone: this.props.phone,
      socialHandle: this.props.socialHandle,
      facebookUrl: this.props.facebookUrl,
      instagramUrl: this.props.instagramUrl,
      tiktokUrl: this.props.tiktokUrl,
      order: this.props.order,
      isActive: this.props.isActive,
    };
  }

  toResponseDto(): AgencyCardResponseDto {
    if (!this.props.id) {
      throw new Error("Cannot convert unpersisted entity to response DTO");
    }
    const dto = new AgencyCardResponseDto();
    dto.id = this.props.id;
    dto.title = this.props.title;
    dto.imageUrl = this.props.imageUrl;
    dto.location = this.props.location;
    dto.lodgingType = this.props.lodgingType;
    dto.distance = this.props.distance;
    dto.email = this.props.email;
    dto.phone = this.props.phone;
    dto.socialHandle = this.props.socialHandle;
    dto.facebookUrl = this.props.facebookUrl;
    dto.instagramUrl = this.props.instagramUrl;
    dto.tiktokUrl = this.props.tiktokUrl;
    dto.order = this.props.order;
    dto.isActive = this.props.isActive;
    dto.createdAt = this.props.createdAt;
    dto.updatedAt = this.props.updatedAt;
    return dto;
  }
}
