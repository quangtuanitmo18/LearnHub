import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryRepository extends BaseService<
  Prisma.CategoryGetPayload<Record<string, never>>,
  CreateCategoryDto,
  UpdateCategoryDto,
  Prisma.CategoryWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Category;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['name', 'slug'],
      selectFields: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Find category by name
   */
  async findByName(name: string) {
    return this.findOneOrNull({ name });
  }

  /**
   * Check if slug exists (excluding current category for updates)
   */
  async isSlugExists(slug: string, excludeId?: string) {
    const where: Prisma.CategoryWhereInput = { slug };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }
    const category = await this.findFirst(where);
    return !!category;
  }

  /**
   * Check if name exists (excluding current category for updates)
   */
  async isNameExists(name: string, excludeId?: string) {
    const where: Prisma.CategoryWhereInput = { name };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }
    const category = await this.findFirst(where);
    return !!category;
  }

  /**
   * Bulk delete categories by IDs
   */
  async bulkDelete(ids: string[]) {
    return this.prismaService.category.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
