import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateContestDto, UpdateContestDto } from './dto/contest.dto';

@Injectable()
export class ContestRepository extends BaseService<
  Prisma.ContestGetPayload<Record<string, never>>,
  CreateContestDto,
  UpdateContestDto,
  Prisma.ContestWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Contest;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['title', 'slug'],
      selectFields: {
        id: true,
        title: true,
        slug: true,
        description: true,
        imageId: true,
        passScore: true,
        maxAttempts: true,
        durationSec: true,
        startTime: true,
        endTime: true,
        showResultDate: true,
        isMembership: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Check if slug exists (excluding current contest for updates)
   */
  async isSlugExists(slug: string, excludeId?: string) {
    const where: Prisma.ContestWhereInput = { slug };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }
    const contest = await this.findFirst(where);
    return !!contest;
  }

  /**
   * Find contest with questions and options
   */
  async findWithQuestions(id: string) {
    return this.prismaService.contest.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: { orderBy: { order: 'asc' } },
          },
        },
        _count: {
          select: { attempts: true },
        },
      },
    });
  }

  /**
   * Bulk delete contests by IDs
   */
  async bulkDelete(ids: string[]) {
    return this.prismaService.contest.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
