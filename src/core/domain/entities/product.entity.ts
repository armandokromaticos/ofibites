import {
  Product as PrismaProduct,
  ProductSize as PrismaProductSize,
  ProductModifierGroup as PrismaProductModifierGroup,
  ProductModifier as PrismaProductModifier,
  ModifierSizePrice as PrismaModifierSizePrice,
  Tag as PrismaTag,
  Prisma,
} from "@prisma/client";
import { CreateProductDto } from "../../application/dto/products/create-product.dto";
import { ProductResponseDto } from "../../application/dto/products/product-response.dto";
import { ProductSizeEntity } from "./product-size.entity";
import { ProductModifierGroupEntity } from "./product-modifier-group.entity";
import { ProductModifierEntity } from "./product-modifier.entity";
import { TagEntity } from "./tag.entity";

type PrismaModifierWithTags = PrismaProductModifier & {
  tags?: { tag: PrismaTag }[];
  sizePrices?: PrismaModifierSizePrice[];
};

type PrismaProductWithRelations = PrismaProduct & {
  sizes?: PrismaProductSize[];
  modifierGroups?: (PrismaProductModifierGroup & {
    modifiers: PrismaModifierWithTags[];
  })[];
  tags?: { tag: PrismaTag }[];
};

interface ProductProps {
  id: string;
  nameEs: string;
  nameEn: string | null;
  descriptionEs: string | null;
  descriptionEn: string | null;
  basePrice: number;
  image: string | null;
  stock: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  sizes?: ProductSizeEntity[];
  modifierGroups?: {
    group: ProductModifierGroupEntity;
    modifiers: ProductModifierEntity[];
  }[];
  tags?: TagEntity[];
}

export class ProductEntity {
  private props: ProductProps;

  constructor(props: ProductProps) {
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
  get descriptionEs(): string | null {
    return this.props.descriptionEs;
  }
  get descriptionEn(): string | null {
    return this.props.descriptionEn;
  }
  get basePrice(): number {
    return this.props.basePrice;
  }
  get image(): string | null {
    return this.props.image;
  }
  get stock(): number | null {
    return this.props.stock;
  }
  get computedStock(): number | null {
    if (this.props.sizes) {
      const activeSizesWithStock = this.props.sizes.filter(
        (size) => size.isActive && size.stock !== null,
      );
      if (activeSizesWithStock.length > 0) {
        return activeSizesWithStock.reduce((sum, size) => sum + size.stock!, 0);
      }
    }
    return this.props.stock;
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

  static fromPrisma(prisma: PrismaProductWithRelations): ProductEntity {
    const props: ProductProps = {
      id: prisma.id,
      nameEs: prisma.nameEs,
      nameEn: prisma.nameEn,
      descriptionEs: prisma.descriptionEs,
      descriptionEn: prisma.descriptionEn,
      basePrice: Number(prisma.basePrice),
      image: prisma.image,
      stock: prisma.stock,
      isActive: prisma.isActive,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    };

    if (prisma.sizes) {
      props.sizes = prisma.sizes.map((size) =>
        ProductSizeEntity.fromPrisma(size),
      );
    }

    if (prisma.modifierGroups) {
      props.modifierGroups = prisma.modifierGroups.map((modifierGroup) => ({
        group: ProductModifierGroupEntity.fromPrisma(modifierGroup),
        modifiers: modifierGroup.modifiers.map((modifier) =>
          ProductModifierEntity.fromPrisma(modifier),
        ),
      }));
    }

    if (prisma.tags) {
      props.tags = prisma.tags.map((pt) => TagEntity.fromPrisma(pt.tag));
    }

    return new ProductEntity(props);
  }

  static fromCreateDto(dto: CreateProductDto): ProductEntity {
    return new ProductEntity({
      id: "",
      nameEs: dto.nameEs.trim(),
      nameEn: dto.nameEn?.trim() || null,
      descriptionEs: dto.descriptionEs?.trim() || null,
      descriptionEn: dto.descriptionEn?.trim() || null,
      basePrice: dto.basePrice,
      image: dto.image ?? null,
      stock: dto.stock ?? null,
      isActive: dto.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toPrismaCreate(): Prisma.ProductCreateInput {
    return {
      nameEs: this.props.nameEs,
      nameEn: this.props.nameEn,
      descriptionEs: this.props.descriptionEs,
      descriptionEn: this.props.descriptionEn,
      basePrice: new Prisma.Decimal(this.props.basePrice),
      image: this.props.image,
      stock: this.props.stock,
      isActive: this.props.isActive,
    };
  }

  toResponseDto(lang: "es" | "en" = "es"): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = this.props.id;
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
    dto.basePrice = this.props.basePrice;
    dto.image = this.props.image;
    dto.stock = this.computedStock;
    dto.isActive = this.props.isActive;
    dto.createdAt = this.props.createdAt;
    dto.updatedAt = this.props.updatedAt;

    if (this.props.sizes) {
      dto.sizes = this.props.sizes.map((size) => size.toResponseDto(lang));
    }

    if (this.props.modifierGroups) {
      dto.modifierGroups = this.props.modifierGroups.map(
        ({ group, modifiers }) => {
          const groupDto = group.toResponseDto(lang);
          groupDto.modifiers = modifiers.map((modifier) =>
            modifier.toResponseDto(lang),
          );
          return groupDto;
        },
      );
    }

    if (this.props.tags) {
      dto.tags = this.props.tags.map((tag) => tag.toResponseDto(lang));
    }

    return dto;
  }
}
