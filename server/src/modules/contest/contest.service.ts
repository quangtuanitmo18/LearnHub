import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { ContestStatus } from 'src/generated/prisma/enums';

@Injectable()
export class ContestService {
  constructor(private readonly prismaService: PrismaService) {}

  async getPublicContests() {
    return this.prismaService.contest.findMany({
      where: { status: ContestStatus.PUBLISHED },
      orderBy: { createdAt: 'desc' },
      select: {
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
        createdAt: true,
      },
    });
  }

  async getContestBySlug(slug: string) {
    const contest = await this.prismaService.contest.findUnique({
      where: { slug },
    });
    if (!contest || contest.status !== ContestStatus.PUBLISHED) {
      throw new NotFoundException('Contest not found');
    }
    return contest;
  }
}
