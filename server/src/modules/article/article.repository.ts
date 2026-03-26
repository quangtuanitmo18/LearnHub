import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';

@Injectable()
export class ArticleRepository extends BaseService<
  Prisma.ArticleGetPayload<object>,
  CreateArticleDto,
  UpdateArticleDto,
  Prisma.ArticleWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Article;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['description'],
      selectFields: {
        id: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Bulk delete articles by IDs
   */
  async bulkDelete(ids: string[]) {
    return this.prismaService.article.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
