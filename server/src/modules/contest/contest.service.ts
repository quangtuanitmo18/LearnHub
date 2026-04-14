import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { ContestStatus } from 'src/generated/prisma/enums';
import { CreateContestDto, UpdateContestDto } from './dto/contest.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { ContestRepository } from './contest.repository';

@Injectable()
export class ContestService {
  constructor(
    private readonly contestRepository: ContestRepository,
    private readonly prismaService: PrismaService,
  ) {}

  // ─── Public APIs ──────────────────────────────────────────────

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
        _count: {
          select: { questions: true },
        },
      },
    });
  }

  async getContestBySlug(slug: string) {
    const contest = await this.prismaService.contest.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });
    if (!contest || contest.status !== ContestStatus.PUBLISHED) {
      throw new NotFoundException('Contest not found');
    }
    return contest;
  }

  async getMyContestHistory(userId: string) {
    // Find absolute best attempts per contest for the user
    const userAttempts = await this.prismaService.quizAttempt.findMany({
      where: {
        userId,
        contestId: { not: null },
      },
      include: {
        contest: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageId: true,
            passScore: true,
          },
        },
      },
      orderBy: {
        score: 'desc',
      },
    });

    // Group by contest and get the best score info + total attempts
    const historyMap = new Map<string, any>();

    for (const attempt of userAttempts) {
      const cId = attempt.contestId!;
      if (!historyMap.has(cId)) {
        historyMap.set(cId, {
          contest: attempt.contest,
          bestScore: attempt.score || 0,
          bestAttemptStatus: attempt.status,
          totalAttempts: 1,
          lastAttemptAt: attempt.startedAt,
        });
      } else {
        const current = historyMap.get(cId);
        current.totalAttempts += 1;
        // Keep the latest date
        if (
          attempt.startedAt &&
          current.lastAttemptAt &&
          attempt.startedAt > current.lastAttemptAt
        ) {
          current.lastAttemptAt = attempt.startedAt;
        }
      }
    }

    return Array.from(historyMap.values()).sort(
      (a, b) => b.lastAttemptAt.getTime() - a.lastAttemptAt.getTime(),
    );
  }

  // ─── Admin CRUD APIs ──────────────────────────────────────────

  async getAllContests(paginationQuery?: PaginationQueryDto) {
    return this.contestRepository.findAll(paginationQuery);
  }

  async getContestById(id: string) {
    const contest = await this.contestRepository.findWithQuestions(id);
    if (!contest) {
      throw new NotFoundException('Contest not found');
    }
    return contest;
  }

  async createContest(createContestDto: CreateContestDto) {
    const existingSlug = await this.contestRepository.isSlugExists(
      createContestDto.slug,
    );
    if (existingSlug) {
      throw new BadRequestException('Contest slug already exists');
    }

    return this.contestRepository.create(createContestDto);
  }

  async updateContest(id: string, updateContestDto: UpdateContestDto) {
    const existing = await this.contestRepository.findOneOrNull({ id });
    if (!existing) {
      throw new NotFoundException('Contest not found');
    }

    if (updateContestDto.slug) {
      const existingSlug = await this.contestRepository.isSlugExists(
        updateContestDto.slug,
        id,
      );
      if (existingSlug) {
        throw new BadRequestException('Contest slug already exists');
      }
    }

    return this.contestRepository.update({ id }, updateContestDto);
  }

  async deleteContest(id: string) {
    const existing = await this.contestRepository.findOneOrNull({ id });
    if (!existing) {
      throw new NotFoundException('Contest not found');
    }
    return this.contestRepository.delete({ id });
  }

  async bulkDeleteContests(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for deletion');
    }

    const result = await this.contestRepository.bulkDelete(ids);

    if (result.count === 0) {
      throw new NotFoundException('No contests found with the provided IDs');
    }

    return {
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} ${result.count === 1 ? 'contest' : 'contests'}`,
    };
  }

  // ─── Contest Question Management ──────────────────────────────

  private readonly questionInclude = {
    options: { orderBy: { order: 'asc' as const } },
  };

  async getContestQuestions(contestId: string) {
    const contest = await this.contestRepository.findOneOrNull({
      id: contestId,
    });
    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    return this.prismaService.quizQuestion.findMany({
      where: { contestId },
      orderBy: { order: 'asc' },
      include: this.questionInclude,
    });
  }

  async addContestQuestion(contestId: string, question: any) {
    const contest = await this.contestRepository.findOneOrNull({
      id: contestId,
    });
    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    return this.prismaService.quizQuestion.create({
      data: {
        contestId,
        type: question.type,
        text: question.text,
        explanation: question.explanation,
        order: question.order ?? 0,
        points: question.points ?? 1,
        options: {
          create: (question.options || []).map((opt: any) => ({
            text: opt.text,
            order: opt.order ?? 0,
            isCorrect: opt.isCorrect,
          })),
        },
      },
      include: this.questionInclude,
    });
  }

  async updateContestQuestion(
    contestId: string,
    questionId: string,
    question: any,
  ) {
    // Delete old options
    await this.prismaService.quizOption.deleteMany({
      where: { questionId },
    });

    // Update question and recreate options
    return this.prismaService.quizQuestion.update({
      where: { id: questionId },
      data: {
        type: question.type,
        text: question.text,
        explanation: question.explanation,
        order: question.order ?? 0,
        points: question.points ?? 1,
        options: {
          create: (question.options || []).map((opt: any) => ({
            text: opt.text,
            order: opt.order ?? 0,
            isCorrect: opt.isCorrect,
          })),
        },
      },
      include: this.questionInclude,
    });
  }

  async deleteContestQuestion(contestId: string, questionId: string) {
    await this.prismaService.quizQuestion.delete({
      where: { id: questionId },
    });
    return { message: 'Question deleted successfully' };
  }

  async reorderContestQuestions(contestId: string, questionIds: string[]) {
    for (let i = 0; i < questionIds.length; i++) {
      await this.prismaService.quizQuestion.update({
        where: { id: questionIds[i] },
        data: { order: i },
      });
    }

    return this.prismaService.quizQuestion.findMany({
      where: { contestId },
      orderBy: { order: 'asc' },
      include: this.questionInclude,
    });
  }
}
