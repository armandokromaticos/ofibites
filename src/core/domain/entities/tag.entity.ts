import { Prisma, Tag as PrismaTag } from "@prisma/client";
import { CreateTagDto } from "../../application/dto/tags/create-tag.dto";
import { TagResponseDto } from "../../application/dto/tags/tag-response.dto";

interface TagProps {
  id: string;
  nameEs: string;
  nameEn: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class TagEntity {
  private props: TagProps;

  constructor(props: TagProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }
  get nameEs(): string {
    return this.props.nameEs;
  }
  get nameEn(): string | null {
    return this.props.nameEn;
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

  static fromPrisma(prisma: PrismaTag): TagEntity {
    return new TagEntity({
      id: prisma.id,
      nameEs: prisma.nameEs,
      nameEn: prisma.nameEn,
      isActive: prisma.isActive,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  static fromCreateDto(dto: CreateTagDto): TagEntity {
    return new TagEntity({
      id: "",
      nameEs: dto.nameEs.trim(),
      nameEn: dto.nameEn?.trim() || null,
      isActive: dto.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toPrismaCreate(): Prisma.TagCreateInput {
    return {
      nameEs: this.props.nameEs,
      nameEn: this.props.nameEn,
      isActive: this.props.isActive,
    };
  }

  toResponseDto(lang: "es" | "en" = "es"): TagResponseDto {
    const dto = new TagResponseDto();
    dto.id = this.props.id;
    dto.name =
      lang === "en"
        ? this.props.nameEn?.trim() || this.props.nameEs
        : this.props.nameEs;
    dto.nameEs = this.props.nameEs;
    dto.nameEn = this.props.nameEn;
    dto.isActive = this.props.isActive;
    dto.createdAt = this.props.createdAt;
    dto.updatedAt = this.props.updatedAt;
    return dto;
  }
}
