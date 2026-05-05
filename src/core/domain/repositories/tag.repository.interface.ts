import { Prisma } from "@prisma/client";
import { TagEntity } from "../entities/tag.entity";

export const TAG_REPOSITORY = Symbol("TAG_REPOSITORY");

export interface ITagRepository {
  create(entity: TagEntity): Promise<TagEntity>;
  findUnique(args: Prisma.TagFindUniqueArgs): Promise<TagEntity | null>;
  findMany(
    args?: Prisma.TagFindManyArgs,
  ): Promise<{ data: TagEntity[]; total?: number }>;
  update(args: Prisma.TagUpdateArgs): Promise<TagEntity>;
  delete(id: string): Promise<void>;
  exists(args: Prisma.TagCountArgs): Promise<boolean>;
}
