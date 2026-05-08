import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { extname } from "node:path";
import type { IProductRepository } from "../../../domain/repositories/product.repository.interface";
import {
  PRODUCT_FULL_INCLUDE,
  PRODUCT_REPOSITORY,
} from "../../../domain/repositories/product.repository.interface";
import { SupabaseService } from "../../../infrastructure/supabase/supabase.service";
import { ProductEntity } from "../../../domain/entities/product.entity";

const BUCKET = "product-images";

export interface UploadFileInput {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

@Injectable()
export class UploadProductImageUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(
    productId: string,
    file: UploadFileInput,
  ): Promise<ProductEntity> {
    const existing = await this.productRepository.findUnique({
      where: { id: productId },
    });
    if (!existing) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const extFromName = extname(file.originalname || "")
      .replace(".", "")
      .toLowerCase();
    const extFromMime =
      file.mimetype === "image/png"
        ? "png"
        : file.mimetype === "image/webp"
          ? "webp"
          : "jpg";
    const nameAllowed = ["jpg", "jpeg", "png", "webp"].includes(extFromName);
    const mimeAligned =
      extFromName === extFromMime ||
      (extFromMime === "jpg" && extFromName === "jpeg");
    const ext = nameAllowed && mimeAligned ? extFromName : extFromMime;
    const filePath = `${productId}/${randomUUID()}.${ext}`;

    const publicUrl = await this.supabaseService.uploadFile(
      BUCKET,
      filePath,
      file.buffer,
      file.mimetype,
    );

    return this.productRepository.update({
      where: { id: productId },
      data: { image: publicUrl },
      include: PRODUCT_FULL_INCLUDE,
    });
  }
}
