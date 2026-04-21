import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import * as ExcelJS from 'exceljs';
import { ContestStatus } from 'src/generated/prisma/enums';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { QUEUE_NAMES } from 'src/shared/queues/queue.constants';
import { PrismaService } from 'src/shared/services/prisma.service';
import { ContestRepository } from './contest.repository';
import { CreateContestDto, UpdateContestDto } from './dto/contest.dto';

@Injectable()
export class ContestService {
  constructor(
    private readonly contestRepository: ContestRepository,
    private readonly prismaService: PrismaService,
    @InjectQueue(QUEUE_NAMES.CONTEST) private readonly contestQueue: Queue,
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

    const contest = await this.contestRepository.create(createContestDto);
    await this.scheduleContestJobs(contest);
    return contest;
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

    const contest = await this.contestRepository.update(
      { id },
      updateContestDto,
    );
    await this.scheduleContestJobs(contest);
    return contest;
  }

  async deleteContest(id: string) {
    const existing = await this.contestRepository.findOneOrNull({ id });
    if (!existing) {
      throw new NotFoundException('Contest not found');
    }

    // Clean up jobs
    await this.removeContestJobs(id);

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

  async exportContestResults(contestId: string): Promise<ExcelJS.Buffer> {
    const contest = await this.contestRepository.findOneOrNull({
      id: contestId,
    });
    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    const attempts = await this.prismaService.quizAttempt.findMany({
      where: { contestId },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: [{ score: 'desc' }, { startedAt: 'asc' }],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Results');

    worksheet.columns = [
      { header: 'Họ và tên', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Điểm', key: 'score', width: 10 },
      { header: 'Số câu đúng', key: 'correct', width: 15 },
      { header: 'Tổng câu', key: 'total', width: 15 },
      { header: 'Cảnh cáo (Gian lận)', key: 'strikes', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Ngày thi', key: 'startedAt', width: 20 },
      { header: 'Ngày nộp', key: 'submittedAt', width: 20 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };

    attempts.forEach((attempt) => {
      worksheet.addRow({
        name: attempt.user?.name || 'N/A',
        email: attempt.user?.email || 'N/A',
        score: attempt.score ?? 0,
        correct: attempt.correctCount ?? 0,
        total: attempt.totalCount ?? 0,
        strikes: attempt.strikes ?? 0,
        status: attempt.status,
        startedAt: attempt.startedAt
          ? attempt.startedAt.toLocaleString('vi-VN')
          : '',
        submittedAt: attempt.submittedAt
          ? attempt.submittedAt.toLocaleString('vi-VN')
          : '',
      });
    });

    return workbook.xlsx.writeBuffer();
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

  // ─── Job Scheduling Helpers ─────────────────────────────────────

  private async removeContestJobs(contestId: string) {
    const submitJobId = `force-submit-${contestId}`;
    const submitJob = await this.contestQueue.getJob(submitJobId);
    if (submitJob) await submitJob.remove();

    const notifyJobId = `notify-result-${contestId}`;
    const notifyJob = await this.contestQueue.getJob(notifyJobId);
    if (notifyJob) await notifyJob.remove();
  }

  private async scheduleContestJobs(contest: any) {
    const now = Date.now();

    // 1. Force-submit job
    if (contest.endTime) {
      const endTime = new Date(contest.endTime).getTime();
      const delay = endTime - now;
      if (delay > 0) {
        const jobId = `force-submit-${contest.id}`;
        const existingJob = await this.contestQueue.getJob(jobId);
        if (existingJob) await existingJob.remove();

        await this.contestQueue.add(
          'force-submit-contest',
          { contestId: contest.id },
          { delay, jobId, removeOnComplete: true },
        );
      }
    }

    // 2. Notify result job
    if (contest.showResultDate) {
      const showDate = new Date(contest.showResultDate).getTime();
      const delay = showDate - now;
      if (delay > 0) {
        const jobId = `notify-result-${contest.id}`;
        const existingJob = await this.contestQueue.getJob(jobId);
        if (existingJob) await existingJob.remove();

        await this.contestQueue.add(
          'notify-contest-result',
          { contestId: contest.id, title: contest.title, slug: contest.slug },
          { delay, jobId, removeOnComplete: true },
        );
      }
    }
  }
}
