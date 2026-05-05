import {
  Prisma,
  ProductModifierGroup as PrismaProductModifierGroup,
} from "@prisma/client";
import { CreateProductModifierGroupDto } from "../../application/dto/product-modifier-groups/create-product-modifier-group.dto";
import { ProductModifierGroupResponseDto } from "../../application/dto/product-modifier-groups/product-modifier-group-response.dto";

interface ProductModifierGroupProps {
  id: string;
  productId: string;
  nameEs: string;
  nameEn: string | null;
  descriptionEs: string | null;
  descriptionEn: string | null;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
}

export class ProductModifierGroupEntity {
  private props: ProductModifierGroupProps;

  constructor(props: ProductModifierGroupProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }
  get productId(): string {
    return this.props.productId;
  }
  get nameEs(): string {
    return this.props.nameEs;
  }
  get nameEn(): string | null {
    return this.props.nameEn;
  }
  get descriptionEs(): string | null {
    return this.props.descriptionEs;
  }
  get descriptionEn(): string | null {
    return this.props.descriptionEn;
  }
  get minSelect(): number {
    return this.props.minSelect;
  }
  get maxSelect(): number {
    return this.props.maxSelect;
  }
  get sortOrder(): number {
    return this.props.sortOrder;
  }
  get isRequired(): boolean {
    return this.props.minSelect > 0;
  }

  static fromPrisma(
    prisma: PrismaProductModifierGroup,
  ): ProductModifierGroupEntity {
    return new ProductModifierGroupEntity({
      id: prisma.id,
      productId: prisma.productId,
      nameEs: prisma.nameEs,
      nameEn: prisma.nameEn,
      descriptionEs: prisma.descriptionEs,
      descriptionEn: prisma.descriptionEn,
      minSelect: prisma.minSelect,
      maxSelect: prisma.maxSelect,
      sortOrder: prisma.sortOrder,
    });
  }

  static fromCreateDto(
    productId: string,
    dto: CreateProductModifierGroupDto,
  ): ProductModifierGroupEntity {
    return new ProductModifierGroupEntity({
      id: "",
      productId,
      nameEs: dto.nameEs.trim(),
      nameEn: dto.nameEn?.trim() || null,
      descriptionEs: dto.descriptionEs?.trim() || null,
      descriptionEn: dto.descriptionEn?.trim() || null,
      minSelect: dto.minSelect ?? 0,
      maxSelect: dto.maxSelect ?? 1,
      sortOrder: dto.sortOrder ?? 0,
    });
  }

  toPrismaCreate(): Prisma.ProductModifierGroupCreateInput {
    return {
      nameEs: this.props.nameEs,
      nameEn: this.props.nameEn,
      descriptionEs: this.props.descriptionEs,
      descriptionEn: this.props.descriptionEn,
      minSelect: this.props.minSelect,
      maxSelect: this.props.maxSelect,
      sortOrder: this.props.sortOrder,
      product: { connect: { id: this.props.productId } },
    };
  }

  toResponseDto(lang: "es" | "en" = "es"): ProductModifierGroupResponseDto {
    const dto = new ProductModifierGroupResponseDto();
    dto.id = this.props.id;
    dto.productId = this.props.productId;
    dto.name =
      lang === "en"
        ? this.props.nameEn?.trim() || this.props.nameEs
        : this.props.nameEs;
    dto.nameEs = this.props.nameEs;
    dto.nameEn = this.props.nameEn;
    dto.description =
      lang === "en"
        ? this.props.descriptionEn?.trim() || this.props.descriptionEs
        : this.props.descriptionEs;
    dto.descriptionEs = this.props.descriptionEs;
    dto.descriptionEn = this.props.descriptionEn;
    dto.minSelect = this.props.minSelect;
    dto.maxSelect = this.props.maxSelect;
    dto.sortOrder = this.props.sortOrder;
    dto.isRequired = this.isRequired;
    return dto;
  }
}
