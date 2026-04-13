import { InjectQueue } from '@nestjs/bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { Cache } from 'cache-manager';
import { AttemptStatus } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  AttemptContentResponseDto,
  AttemptMetaResponseDto,
  AttemptResultResponseDto,
  AttemptsListResponseDto,
  SaveAnswersDto,
  SubmitAttemptDto,
  SubmitResultResponseDto,
} from './dto/quiz-attempt.dto';
import { QuizAttemptRepository } from './quiz-attempt.repository';

@Injectable()
export class QuizAttemptService {
  constructor(
    private readonly quizAttemptRepository: QuizAttemptRepository,
    private readonly prismaService: PrismaService,
    @InjectQueue('gamification') private readonly gamificationQueue: Queue,
    @InjectQueue('quiz-attempt') private readonly quizQueue: Queue,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private async verifyCourseAccess(userId: string, lessonId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAdmin = user.roles.some(
      (role) => role.name === 'Admin' || role.name === 'Super Admin',
    );

    if (isAdmin) return;

    const lesson = await this.prismaService.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const order = await this.prismaService.order.findFirst({
      where: {
        userId,
        status: 'COMPLETED',
        items: {
          some: { courseId: lesson.courseId },
        },
      },
    });

    const hasMembership =
      user.isMembership &&
      user.planEndDate &&
      new Date(user.planEndDate) > new Date();

    if (!order && !hasMembership) {
      throw new ForbiddenException(
        'You must purchase this course or have an active membership to access quizzes',
      );
    }
  }

  /**
   * Check if attempt is expired and update status if needed (Lazy-expire)
   */
  private async lazyExpireAttempt(attempt: {
    id: string;
    status: string;
    expiresAt: Date | null;
  }): Promise<boolean> {
    if (
      attempt.status === AttemptStatus.IN_PROGRESS &&
      attempt.expiresAt &&
      new Date() > attempt.expiresAt
    ) {
      await this.quizAttemptRepository.expireAttempt(attempt.id);
      return true; // Attempt was expired
    }
    return false;
  }

  /**
   * Start or resume a quiz attempt
   * POST /api/quizzes/:lessonId/attempts/start
   */
  async startOrResumeAttempt(
    referenceId: string,
    userId: string,
    isContest: boolean = false,
  ): Promise<AttemptMetaResponseDto> {
    if (!isContest) {
      await this.verifyCourseAccess(userId, referenceId);
    } else {
      // Contest is public or requires membership. We can verify membership here.
      const contest = await this.prismaService.contest.findUnique({
        where: { id: referenceId },
      });
      if (contest?.isMembership) {
        const user = await this.prismaService.user.findUnique({
          where: { id: userId },
          include: { roles: true },
        });
        const hasMembership =
          user?.isMembership &&
          user.planEndDate &&
          new Date(user.planEndDate) > new Date();
        if (
          !hasMembership &&
          !user?.roles.some(
            (r) => r.name === 'Admin' || r.name === 'Super Admin',
          )
        ) {
          throw new ForbiddenException(
            'Membership is required for this contest',
          );
        }
      }
    }

    // Find the quiz
    const quiz = isContest
      ? await this.quizAttemptRepository.findContestById(referenceId)
      : await this.quizAttemptRepository.findQuizByLessonId(referenceId);
    if (!quiz) {
      throw new NotFoundException('Quiz not found for this lesson');
    }

    if (isContest || (quiz as any).isContest) {
      const now = new Date();
      if (quiz.startTime && now < quiz.startTime) {
        throw new ForbiddenException('The contest has not started yet');
      }
      if (quiz.endTime && now > quiz.endTime) {
        throw new ForbiddenException('The contest has already ended');
      }
    }

    // Check for existing IN_PROGRESS attempt
    const existingAttempt =
      await this.quizAttemptRepository.findInProgressAttempt(
        referenceId,
        userId,
        isContest,
      );

    if (existingAttempt) {
      // Check if it's expired (lazy-expire)
      const isExpired = await this.lazyExpireAttempt(existingAttempt);
      if (!isExpired) {
        // Return existing valid attempt (resume)
        return {
          attemptId: existingAttempt.id,
          lessonId: existingAttempt.lessonId || undefined,
          attemptNo: existingAttempt.attemptNo,
          status: existingAttempt.status,
          startedAt: existingAttempt.startedAt,
          expiresAt: existingAttempt.expiresAt,
        };
      }
    }

    // Check maxAttempts
    if (quiz.maxAttempts) {
      const usedAttempts =
        await this.quizAttemptRepository.getUsedAttemptsCount(
          referenceId,
          userId,
          isContest,
        );
      if (usedAttempts >= quiz.maxAttempts) {
        throw new BadRequestException(
          `Maximum attempts (${quiz.maxAttempts}) reached`,
        );
      }
    }

    // Create new attempt
    const attemptNo = await this.quizAttemptRepository.getNextAttemptNo(
      referenceId,
      userId,
      isContest,
    );

    // Calculate expiresAt if quiz has time limit
    let expiresAt: Date | undefined;
    if (quiz.durationSec) {
      expiresAt = new Date(Date.now() + quiz.durationSec * 1000);
    }

    // For contests, forcefully bind the expiresAt to the endTime
    if ((isContest || (quiz as any).isContest) && quiz.endTime) {
      if (expiresAt) {
        expiresAt = new Date(
          Math.min(expiresAt.getTime(), quiz.endTime.getTime()),
        );
      } else {
        expiresAt = quiz.endTime;
      }
    }

    const newAttempt = await this.quizAttemptRepository.createAttempt({
      lessonId: isContest ? undefined : referenceId,
      contestId: isContest ? referenceId : undefined,
      userId,
      attemptNo,
      expiresAt,
    });

    // Schedule auto-submit for contest
    if ((isContest || (quiz as any).isContest) && expiresAt) {
      const delayMs = Math.max(0, expiresAt.getTime() - Date.now());
      void this.quizQueue.add(
        'auto-submit-attempt',
        {
          attemptId: newAttempt.id,
          userId: newAttempt.userId,
        },
        { delay: delayMs },
      );
    }

    return {
      attemptId: newAttempt.id,
      lessonId: newAttempt.lessonId || undefined,
      contestId: newAttempt.contestId || undefined,
      attemptNo: newAttempt.attemptNo,
      status: newAttempt.status,
      startedAt: newAttempt.startedAt,
      expiresAt: newAttempt.expiresAt,
    };
  }

  /**
   * Load attempt with quiz content for doing
   * GET /api/attempts/:attemptId
   */
  async getAttemptContent(
    attemptId: string,
    userId: string,
  ): Promise<AttemptContentResponseDto> {
    const attempt =
      await this.quizAttemptRepository.findAttemptWithAnswers(attemptId);

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    // Verify ownership
    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not have access to this attempt');
    }

    // Lazy-expire check
    const isExpired = await this.lazyExpireAttempt(attempt);
    if (isExpired) {
      throw new BadRequestException('This attempt has expired');
    }

    // If already submitted or expired, cannot continue
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Cannot access content for ${attempt.status.toLowerCase()} attempt`,
      );
    }

    // Load quiz questions (without isCorrect)
    const quiz = attempt.contestId
      ? await this.quizAttemptRepository.findContestById(attempt.contestId)
      : attempt.lessonId
        ? await this.quizAttemptRepository.findQuizByLessonId(attempt.lessonId)
        : null;
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Map questions without isCorrect
    const questions = quiz.questions.map((q) => ({
      id: q.id,
      type: q.type,
      text: q.text,
      order: q.order,
      points: q.points,
      options: q.options.map((o) => ({
        id: o.id,
        text: o.text,
        order: o.order,
      })),
    }));

    // Map saved answers
    const savedAnswers = attempt.answers.map((a) => ({
      questionId: a.questionId,
      selectedOptionIds: a.selectedOptionIds,
    }));

    return {
      attemptId: attempt.id,
      lessonId: attempt.lessonId || undefined,
      contestId: attempt.contestId || undefined,
      status: attempt.status,
      expiresAt: attempt.expiresAt,
      questions,
      savedAnswers,
    };
  }

  /**
   * Autosave answers
   * PUT /api/attempts/:attemptId/answers
   */
  async saveAnswers(
    attemptId: string,
    userId: string,
    dto: SaveAnswersDto,
  ): Promise<{ ok: boolean }> {
    const attempt = await this.quizAttemptRepository.findAttemptById(attemptId);

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    // Verify ownership
    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not have access to this attempt');
    }

    // Lazy-expire check
    const isExpired = await this.lazyExpireAttempt(attempt);
    if (isExpired) {
      throw new BadRequestException('This attempt has expired');
    }

    // Only allow saving if IN_PROGRESS
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Cannot save answers for ${attempt.status.toLowerCase()} attempt`,
      );
    }

    await this.quizAttemptRepository.upsertAnswers(
      attemptId,
      dto.answers,
      dto.strikes,
    );

    return { ok: true };
  }

  /**
   * Submit attempt (grade + finalize)
   * POST /api/attempts/:attemptId/submit
   */
  async submitAttempt(
    attemptId: string,
    userId: string,
    dto: SubmitAttemptDto,
    isAutoSubmit = false,
  ): Promise<SubmitResultResponseDto> {
    const attempt = await this.quizAttemptRepository.findAttemptById(attemptId);

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    // Verify ownership
    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not have access to this attempt');
    }

    // If already submitted, return the existing result (idempotent)
    if (attempt.status === AttemptStatus.SUBMITTED) {
      return {
        attemptId: attempt.id,
        status: attempt.status,
        score: attempt.score!,
        maxScore: attempt.maxScore!,
        passed: attempt.passed,
        correctCount: attempt.correctCount!,
        totalCount: attempt.totalCount!,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt!,
      };
    }

    // Lazy-expire check
    const isExpired = await this.lazyExpireAttempt(attempt);
    if (isExpired) {
      throw new BadRequestException('This attempt has expired');
    }

    // Only allow submitting if IN_PROGRESS
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Cannot submit ${attempt.status.toLowerCase()} attempt`,
      );
    }

    // Load questions with correct answers for grading
    const questions = await this.quizAttemptRepository.findQuestionsWithOptions(
      attempt.contestId || attempt.lessonId!,
      !!attempt.contestId,
    );

    // Build answer map from submitted data
    const answerMap = new Map(
      dto.answers.map((a) => [a.questionId, a.selectedOptionIds]),
    );

    // Grade each question with partial scoring
    let score = 0;
    let maxScore = 0;
    let correctCount = 0;
    const totalCount = questions.length;

    const gradedAnswers = questions.map((question) => {
      const selectedOptionIds = answerMap.get(question.id) || [];
      const correctOptionIds = question.options
        .filter((o) => o.isCorrect)
        .map((o) => o.id);

      const totalCorrectOptions = correctOptionIds.length;

      // Count how many correct options were selected
      const correctSelected = selectedOptionIds.filter((id) =>
        correctOptionIds.includes(id),
      ).length;
      const wrongSelected = selectedOptionIds.filter(
        (id) => !correctOptionIds.includes(id),
      ).length;

      // Calculate partial score based on ratio of correct selections
      let earnedScore = 0;
      if (totalCorrectOptions > 0) {
        const adjustedCorrect = Math.max(correctSelected - wrongSelected, 0);
        earnedScore = (adjustedCorrect / totalCorrectOptions) * question.points;
      }

      const hasOnlyCorrectSelections = selectedOptionIds.every((id) =>
        correctOptionIds.includes(id),
      );

      const isCorrect =
        correctSelected === totalCorrectOptions && hasOnlyCorrectSelections;

      score += earnedScore;
      maxScore += question.points;
      if (isCorrect) correctCount++;

      return {
        questionId: question.id,
        selectedOptionIds,
        isCorrect,
        earnedScore,
      };
    });

    // Get quiz for passScore check and contest check
    const quiz = attempt.contestId
      ? await this.quizAttemptRepository.findContestById(attempt.contestId)
      : attempt.lessonId
        ? await this.quizAttemptRepository.findQuizByLessonId(attempt.lessonId)
        : null;

    if (
      quiz &&
      (!!attempt.contestId || (quiz as any).isContest) &&
      !isAutoSubmit
    ) {
      const now = new Date();
      // Allow a 10 seconds grace period for network latency
      if (quiz.endTime && now.getTime() > quiz.endTime.getTime() + 10000) {
        throw new BadRequestException('The contest has already ended');
      }
    }

    const passed =
      quiz?.passScore != null && maxScore > 0
        ? (score / maxScore) * 100 >= quiz.passScore
        : null;

    // Submit with grading
    const submittedAttempt = await this.quizAttemptRepository.submitAttempt(
      attemptId,
      gradedAnswers,
      {
        score,
        maxScore,
        passed,
        correctCount,
        totalCount,
        strikes: dto.strikes,
      },
    );

    // Gamification: +20 points for passing a quiz
    if (passed === true) {
      void this.gamificationQueue.add('add-points', {
        userId,
        points: 20,
        reason: 'QUIZ_PASSED',
        metadata: {
          lessonId: attempt.lessonId || undefined,
          contestId: attempt.contestId || undefined,
          attemptId,
        },
      });
    }

    return {
      attemptId: submittedAttempt.id,
      status: submittedAttempt.status,
      score: submittedAttempt.score!,
      maxScore: submittedAttempt.maxScore!,
      passed: submittedAttempt.passed,
      correctCount: submittedAttempt.correctCount!,
      totalCount: submittedAttempt.totalCount!,
      startedAt: submittedAttempt.startedAt,
      submittedAt: submittedAttempt.submittedAt!,
    };
  }

  /**
   * Get attempt result (review)
   * GET /api/attempts/:attemptId/result
   */
  async getAttemptResult(
    attemptId: string,
    userId: string,
  ): Promise<AttemptResultResponseDto> {
    const attempt =
      await this.quizAttemptRepository.findAttemptResult(attemptId);

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    // Verify ownership
    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not have access to this attempt');
    }

    // Only allow viewing result for SUBMITTED or EXPIRED attempts
    if (attempt.status === AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Attempt has not been submitted yet');
    }

    const quiz = attempt.contestId
      ? await this.quizAttemptRepository.findContestById(attempt.contestId)
      : attempt.lessonId
        ? await this.quizAttemptRepository.findQuizByLessonId(attempt.lessonId)
        : null;
    if (quiz && (!!attempt.contestId || (quiz as any).isContest)) {
      const now = new Date();
      if (quiz.showResultDate && now < quiz.showResultDate) {
        // Blind Result: Return only scores, NO answers yet.
        return {
          attemptId: attempt.id,
          lessonId: attempt.lessonId || undefined,
          contestId: attempt.contestId || undefined,
          attemptNo: attempt.attemptNo,
          status: attempt.status,
          score: attempt.score ?? 0,
          maxScore: attempt.maxScore ?? 0,
          passed: attempt.passed,
          answers: [], // Hide the details!
        };
      }
    }

    // Map answers with question details
    const answers = attempt.answers.map((answer) => {
      return {
        questionId: answer.questionId,
        question: {
          type: answer.question.type,
          text: answer.question.text,
          points: answer.question.points,
          explanation: (answer.question as any).explanation ?? null,
          options: answer.question.options.map((o) => ({
            id: o.id,
            text: o.text,
            order: o.order,
            isCorrect: o.isCorrect,
          })),
        },
        selectedOptionIds: answer.selectedOptionIds,
        isCorrect: answer.isCorrect ?? false,
        earnedScore: answer.earnedScore ?? 0,
      };
    });

    return {
      attemptId: attempt.id,
      lessonId: attempt.lessonId || undefined,
      contestId: attempt.contestId || undefined,
      attemptNo: attempt.attemptNo,
      status: attempt.status,
      score: attempt.score ?? 0,
      maxScore: attempt.maxScore ?? 0,
      passed: attempt.passed,
      answers,
    };
  }

  /**
   * List all attempts for a user on a quiz
   * GET /api/quizzes/:lessonId/attempts
   */
  async listAttempts(
    referenceId: string,
    userId: string,
    isContest: boolean = false,
  ): Promise<AttemptsListResponseDto> {
    if (!isContest) {
      await this.verifyCourseAccess(userId, referenceId);
    } else {
      // Contest is public or requires membership. We can verify membership here.
      const contest = await this.prismaService.contest.findUnique({
        where: { id: referenceId },
      });
      if (contest?.isMembership) {
        const user = await this.prismaService.user.findUnique({
          where: { id: userId },
          include: { roles: true },
        });
        const hasMembership =
          user?.isMembership &&
          user.planEndDate &&
          new Date(user.planEndDate) > new Date();
        if (
          !hasMembership &&
          !user?.roles.some(
            (r) => r.name === 'Admin' || r.name === 'Super Admin',
          )
        ) {
          throw new ForbiddenException(
            'Membership is required for this contest',
          );
        }
      }
    }

    // Get quiz for maxAttempts
    const quiz = isContest
      ? await this.quizAttemptRepository.findContestById(referenceId)
      : await this.quizAttemptRepository.findQuizByLessonId(referenceId);
    if (!quiz) {
      throw new NotFoundException('Quiz not found for this lesson');
    }

    // Get all attempts
    const attempts = await this.quizAttemptRepository.findUserAttempts(
      referenceId,
      userId,
      isContest,
    );

    // Lazy-expire any IN_PROGRESS attempts
    for (const attempt of attempts) {
      if (attempt.status === AttemptStatus.IN_PROGRESS) {
        // Re-check for full data
        const fullAttempt = await this.quizAttemptRepository.findAttemptById(
          attempt.id,
        );
        if (fullAttempt) {
          await this.lazyExpireAttempt(fullAttempt);
        }
      }
    }

    // Refetch after potential expiration
    const updatedAttempts = await this.quizAttemptRepository.findUserAttempts(
      referenceId,
      userId,
      isContest,
    );

    // Count used attempts (SUBMITTED + EXPIRED)
    const usedAttempts = updatedAttempts.filter(
      (a) =>
        a.status === AttemptStatus.SUBMITTED ||
        a.status === AttemptStatus.EXPIRED,
    ).length;

    return {
      lessonId: isContest ? undefined : referenceId,
      contestId: isContest ? referenceId : undefined,
      maxAttempts: quiz.maxAttempts,
      usedAttempts,
      attempts: updatedAttempts.map((a) => ({
        attemptId: a.id,
        attemptNo: a.attemptNo,
        status: a.status,
        score: a.score,
        maxScore: a.maxScore,
        passed: a.passed,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
      })),
    };
  }

  /**
   * Get Leaderboard for a contest
   * GET /api/quizzes/:lessonId/leaderboard
   */
  async getLeaderboard(
    referenceId: string,
    userId: string,
    isContest: boolean = false,
  ) {
    // Only verify access if required, but leaderboards are often public or tied to the course.
    if (!isContest) {
      await this.verifyCourseAccess(userId, referenceId);
    } else {
      // Contest is public or requires membership. We can verify membership here.
      const contest = await this.prismaService.contest.findUnique({
        where: { id: referenceId },
      });
      if (contest?.isMembership) {
        const user = await this.prismaService.user.findUnique({
          where: { id: userId },
          include: { roles: true },
        });
        const hasMembership =
          user?.isMembership &&
          user.planEndDate &&
          new Date(user.planEndDate) > new Date();
        if (
          !hasMembership &&
          !user?.roles.some(
            (r) => r.name === 'Admin' || r.name === 'Super Admin',
          )
        ) {
          throw new ForbiddenException(
            'Membership is required for this contest',
          );
        }
      }
    }

    const cacheKey = isContest
      ? `leaderboard_contest:${referenceId}`
      : `leaderboard:${referenceId}`;
    const cachedLeaderboard = await this.cacheManager.get(cacheKey);
    if (cachedLeaderboard) {
      return cachedLeaderboard;
    }

    const quiz = isContest
      ? await this.quizAttemptRepository.findContestById(referenceId)
      : await this.quizAttemptRepository.findQuizByLessonId(referenceId);
    if (!quiz || (!isContest && !(quiz as any).isContest)) {
      throw new BadRequestException('This quiz is not a contest');
    }

    const attempts = await this.quizAttemptRepository.getLeaderboardAttempts(
      referenceId,
      100,
      isContest,
    );

    // Exact sort calculation logic:
    // Sort by score DESC. If equal, sort by duration ASC.
    const sorted = attempts.sort((a, b) => {
      const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
      if (scoreDiff !== 0) return scoreDiff;

      // Calculate duration
      const durationA =
        a.submittedAt && a.startedAt
          ? a.submittedAt.getTime() - a.startedAt.getTime()
          : Infinity;
      const durationB =
        b.submittedAt && b.startedAt
          ? b.submittedAt.getTime() - b.startedAt.getTime()
          : Infinity;

      return durationA - durationB;
    });

    const leaderboard = sorted.map((attempt, index) => ({
      rank: index + 1,
      attemptId: attempt.id,
      score: attempt.score,
      maxScore: attempt.maxScore,
      durationMs:
        attempt.submittedAt && attempt.startedAt
          ? attempt.submittedAt.getTime() - attempt.startedAt.getTime()
          : null,
      user: {
        id: attempt.user.id,
        username: attempt.user.username,
        avatar: attempt.user.avatar,
      },
      submittedAt: attempt.submittedAt,
    }));

    // Cache the leaderboard for 1 minute (60 * 1000 ms)
    await this.cacheManager.set(cacheKey, leaderboard, 60 * 1000);

    return leaderboard;
  }

  /**
   * Force auto-submit an attempt, called via Queue
   */
  async forceSubmitAttempt(attemptId: string, userId: string) {
    const attempt =
      await this.quizAttemptRepository.findAttemptWithAnswers(attemptId);
    if (!attempt || attempt.status !== AttemptStatus.IN_PROGRESS) return;

    // Map saved answers to SubmitAttemptDto
    const dto: SubmitAttemptDto = {
      strikes: attempt.strikes,
      answers: attempt.answers.map((a) => ({
        questionId: a.questionId,
        selectedOptionIds: a.selectedOptionIds,
      })),
    };

    return this.submitAttempt(attemptId, userId, dto, true);
  }
}
