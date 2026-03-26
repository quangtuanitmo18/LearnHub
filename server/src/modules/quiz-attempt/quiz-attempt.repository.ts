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
   * Find an in-progress attempt for a user
   */
  async findInProgressAttempt(lessonId: string, userId: string) {
    return this.prismaService.quizAttempt.findFirst({
      where: {
        lessonId,
        userId,
        status: AttemptStatus.IN_PROGRESS,
      },
      orderBy: { attemptNo: 'desc' },
    });
  }

  /**
   * Get used attempts count (SUBMITTED + EXPIRED)
   */
  async getUsedAttemptsCount(lessonId: string, userId: string) {
    return this.prismaService.quizAttempt.count({
      where: {
        lessonId,
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
  async getNextAttemptNo(lessonId: string, userId: string) {
    const lastAttempt = await this.prismaService.quizAttempt.findFirst({
      where: { lessonId, userId },
      orderBy: { attemptNo: 'desc' },
      select: { attemptNo: true },
    });
    return (lastAttempt?.attemptNo ?? 0) + 1;
  }

  /**
   * Create a new attempt
   */
  async createAttempt(data: {
    lessonId: string;
    userId: string;
    attemptNo: number;
    expiresAt?: Date;
  }) {
    return this.prismaService.quizAttempt.create({
      data: {
        lessonId: data.lessonId,
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
  ) {
    const operations = answers.map((answer) =>
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
      return tx.quizAttempt.update({
        where: { id: attemptId },
        data: {
          status: AttemptStatus.SUBMITTED,
          submittedAt: new Date(),
          score: summary.score,
          maxScore: summary.maxScore,
          passed: summary.passed,
          correctCount: summary.correctCount,
          totalCount: summary.totalCount,
        },
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
  async findUserAttempts(lessonId: string, userId: string) {
    return this.prismaService.quizAttempt.findMany({
      where: { lessonId, userId },
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
  async findQuestionsWithOptions(lessonId: string) {
    return this.prismaService.quizQuestion.findMany({
      where: { quizId: lessonId },
      orderBy: { order: 'asc' },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }
}
