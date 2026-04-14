import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { AttemptStatus } from 'src/generated/prisma/enums';

@Injectable()
export class QuizAttemptRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Find quiz by lessonId with questions and options
   */
  async findQuizByLessonId(lessonId: string) {
    return this.prismaService.lessonQuiz.findUnique({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  }

  /**
   * Find contest by id with questions and options
   */
  async findContestById(contestId: string) {
    return this.prismaService.contest.findUnique({
      where: { id: contestId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  }

  /**
   * Find an in-progress attempt for a user
   */
  async findInProgressAttempt(
    referenceId: string,
    userId: string,
    isContest: boolean = false,
  ) {
    return this.prismaService.quizAttempt.findFirst({
      where: {
        ...(isContest ? { contestId: referenceId } : { lessonId: referenceId }),
        userId,
        status: AttemptStatus.IN_PROGRESS,
      },
      orderBy: { attemptNo: 'desc' },
    });
  }

  /**
   * Get used attempts count (SUBMITTED + EXPIRED)
   */
  async getUsedAttemptsCount(
    referenceId: string,
    userId: string,
    isContest: boolean = false,
  ) {
    return this.prismaService.quizAttempt.count({
      where: {
        ...(isContest ? { contestId: referenceId } : { lessonId: referenceId }),
        userId,
        status: {
          in: [AttemptStatus.SUBMITTED, AttemptStatus.EXPIRED],
        },
      },
    });
  }

  /**
   * Get the next attempt number for a user
   */
  async getNextAttemptNo(
    referenceId: string,
    userId: string,
    isContest: boolean = false,
  ) {
    const lastAttempt = await this.prismaService.quizAttempt.findFirst({
      where: {
        ...(isContest ? { contestId: referenceId } : { lessonId: referenceId }),
        userId,
      },
      orderBy: { attemptNo: 'desc' },
      select: { attemptNo: true },
    });
    return (lastAttempt?.attemptNo ?? 0) + 1;
  }

  /**
   * Create a new attempt
   */
  async createAttempt(data: {
    lessonId?: string;
    contestId?: string;
    userId: string;
    attemptNo: number;
    expiresAt?: Date;
  }) {
    return this.prismaService.quizAttempt.create({
      data: {
        lessonId: data.lessonId,
        contestId: data.contestId,
        userId: data.userId,
        attemptNo: data.attemptNo,
        expiresAt: data.expiresAt,
        status: AttemptStatus.IN_PROGRESS,
      },
    });
  }

  /**
   * Find attempt by ID
   */
  async findAttemptById(attemptId: string) {
    return this.prismaService.quizAttempt.findUnique({
      where: { id: attemptId },
    });
  }

  /**
   * Find attempt with answers
   */
  async findAttemptWithAnswers(attemptId: string) {
    return this.prismaService.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: true,
      },
    });
  }

  /**
   * Update attempt status to EXPIRED
   */
  async expireAttempt(attemptId: string) {
    return this.prismaService.quizAttempt.update({
      where: { id: attemptId },
      data: { status: AttemptStatus.EXPIRED },
    });
  }

  /**
   * Upsert answers for an attempt (autosave)
   */
  async upsertAnswers(
    attemptId: string,
    answers: { questionId: string; selectedOptionIds: string[] }[],
    strikes?: number,
  ) {
    const operations: any[] = answers.map((answer) =>
      this.prismaService.quizAttemptAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId,
            questionId: answer.questionId,
          },
        },
        update: {
          selectedOptionIds: answer.selectedOptionIds,
        },
        create: {
          attemptId,
          questionId: answer.questionId,
          selectedOptionIds: answer.selectedOptionIds,
        },
      }),
    );

    if (strikes !== undefined) {
      operations.push(
        this.prismaService.quizAttempt.update({
          where: { id: attemptId },
          data: { strikes },
        }),
      );
    }

    return this.prismaService.$transaction(operations);
  }

  /**
   * Submit attempt with grading (all in a transaction)
   */
  async submitAttempt(
    attemptId: string,
    gradedAnswers: {
      questionId: string;
      selectedOptionIds: string[];
      isCorrect: boolean;
      earnedScore: number;
    }[],
    summary: {
      score: number;
      maxScore: number;
      passed: boolean | null;
      correctCount: number;
      totalCount: number;
      strikes?: number;
    },
  ) {
    return this.prismaService.$transaction(async (tx) => {
      // Upsert all answers with grading results
      for (const answer of gradedAnswers) {
        await tx.quizAttemptAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId,
              questionId: answer.questionId,
            },
          },
          update: {
            selectedOptionIds: answer.selectedOptionIds,
            isCorrect: answer.isCorrect,
            earnedScore: answer.earnedScore,
          },
          create: {
            attemptId,
            questionId: answer.questionId,
            selectedOptionIds: answer.selectedOptionIds,
            isCorrect: answer.isCorrect,
            earnedScore: answer.earnedScore,
          },
        });
      }

      // Update attempt with final results
      const updateData: any = {
        status: AttemptStatus.SUBMITTED,
        submittedAt: new Date(),
        score: summary.score,
        maxScore: summary.maxScore,
        passed: summary.passed,
        correctCount: summary.correctCount,
        totalCount: summary.totalCount,
      };

      if (summary.strikes !== undefined) {
        updateData.strikes = summary.strikes;
      }

      return tx.quizAttempt.update({
        where: { id: attemptId },
        data: updateData,
      });
    });
  }

  /**
   * Get attempt result with answers and question snapshots
   */
  async findAttemptResult(attemptId: string) {
    return this.prismaService.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          include: {
            question: {
              include: {
                options: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get all attempts for a user on a quiz
   */
  async findUserAttempts(
    referenceId: string,
    userId: string,
    isContest: boolean = false,
  ) {
    return this.prismaService.quizAttempt.findMany({
      where: {
        ...(isContest ? { contestId: referenceId } : { lessonId: referenceId }),
        userId,
      },
      orderBy: { attemptNo: 'desc' },
      select: {
        id: true,
        attemptNo: true,
        status: true,
        score: true,
        maxScore: true,
        passed: true,
        startedAt: true,
        submittedAt: true,
      },
    });
  }

  /**
   * Find questions with options for a quiz (for grading)
   */
  async findQuestionsWithOptions(
    referenceId: string,
    isContest: boolean = false,
  ) {
    return this.prismaService.quizQuestion.findMany({
      where: {
        ...(isContest ? { contestId: referenceId } : { quizId: referenceId }),
      },
      orderBy: { order: 'asc' },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  /**
   * Get leaderboard attempts for a contest
   */
  async getLeaderboardAttempts(
    referenceId: string,
    limit: number = 100,
    isContest: boolean = false,
  ) {
    // Because Prisma orderBy doesn't support complex duration calculations directly,
    // we fetch SUBMITTED attempts ordered primarily by score.
    // Further duration-based exact sorting can be applied at the service level.
    return this.prismaService.quizAttempt.findMany({
      where: {
        ...(isContest ? { contestId: referenceId } : { lessonId: referenceId }),
        status: AttemptStatus.SUBMITTED,
      },
      orderBy: [{ score: 'desc' }, { submittedAt: 'asc' }],
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Admin: Get completely paginated attempts for a contest/quiz
   */
  async findAdminContestAttempts(
    referenceId: string,
    isContest: boolean = false,
    skip: number,
    take: number,
    search?: string,
    status?: string,
  ) {
    const whereCondition: any = {
      ...(isContest ? { contestId: referenceId } : { lessonId: referenceId }),
    };

    if (status) {
      whereCondition.status = status as AttemptStatus;
    }

    if (search) {
      whereCondition.user = {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    return this.prismaService.quizAttempt.findMany({
      where: whereCondition,
      orderBy: { startedAt: 'desc' },
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Admin: Count attempts for pagination
   */
  async countAdminContestAttempts(
    referenceId: string,
    isContest: boolean = false,
    search?: string,
    status?: string,
  ) {
    const whereCondition: any = {
      ...(isContest ? { contestId: referenceId } : { lessonId: referenceId }),
    };

    if (status) {
      whereCondition.status = status as AttemptStatus;
    }

    if (search) {
      whereCondition.user = {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    return this.prismaService.quizAttempt.count({
      where: whereCondition,
    });
  }

  /**
   * Admin: Delete attempt
   */
  async deleteAttempt(attemptId: string) {
    return this.prismaService.quizAttempt.delete({
      where: { id: attemptId },
    });
  }
}
