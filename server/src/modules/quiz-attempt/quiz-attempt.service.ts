import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { QuizAttemptRepository } from './quiz-attempt.repository';
import {
  SaveAnswersDto,
  SubmitAttemptDto,
  AttemptMetaResponseDto,
  AttemptContentResponseDto,
  SubmitResultResponseDto,
  AttemptResultResponseDto,
  AttemptsListResponseDto,
} from './dto/quiz-attempt.dto';
import { AttemptStatus } from 'src/generated/prisma/enums';

@Injectable()
export class QuizAttemptService {
  constructor(private readonly quizAttemptRepository: QuizAttemptRepository) {}

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
    lessonId: string,
    userId: string,
  ): Promise<AttemptMetaResponseDto> {
    // Find the quiz
    const quiz = await this.quizAttemptRepository.findQuizByLessonId(lessonId);
    if (!quiz) {
      throw new NotFoundException('Quiz not found for this lesson');
    }

    // Check for existing IN_PROGRESS attempt
    const existingAttempt =
      await this.quizAttemptRepository.findInProgressAttempt(lessonId, userId);

    if (existingAttempt) {
      // Check if it's expired (lazy-expire)
      const isExpired = await this.lazyExpireAttempt(existingAttempt);
      if (!isExpired) {
        // Return existing valid attempt (resume)
        return {
          attemptId: existingAttempt.id,
          lessonId: existingAttempt.lessonId,
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
        await this.quizAttemptRepository.getUsedAttemptsCount(lessonId, userId);
      if (usedAttempts >= quiz.maxAttempts) {
        throw new BadRequestException(
          `Maximum attempts (${quiz.maxAttempts}) reached`,
        );
      }
    }

    // Create new attempt
    const attemptNo = await this.quizAttemptRepository.getNextAttemptNo(
      lessonId,
      userId,
    );

    // Calculate expiresAt if quiz has time limit
    let expiresAt: Date | undefined;
    if (quiz.durationSec) {
      expiresAt = new Date(Date.now() + quiz.durationSec * 1000);
    }

    const newAttempt = await this.quizAttemptRepository.createAttempt({
      lessonId,
      userId,
      attemptNo,
      expiresAt,
    });

    return {
      attemptId: newAttempt.id,
      lessonId: newAttempt.lessonId,
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
    const quiz = await this.quizAttemptRepository.findQuizByLessonId(
      attempt.lessonId,
    );
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
      lessonId: attempt.lessonId,
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

    await this.quizAttemptRepository.upsertAnswers(attemptId, dto.answers);

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
      attempt.lessonId,
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

    // Get quiz for passScore check
    const quiz = await this.quizAttemptRepository.findQuizByLessonId(
      attempt.lessonId,
    );
    const passed =
      quiz?.passScore != null && maxScore > 0
        ? (score / maxScore) * 100 >= quiz.passScore
        : null;

    // Submit with grading
    const submittedAttempt = await this.quizAttemptRepository.submitAttempt(
      attemptId,
      gradedAnswers,
      { score, maxScore, passed, correctCount, totalCount },
    );

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
      lessonId: attempt.lessonId,
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
    lessonId: string,
    userId: string,
  ): Promise<AttemptsListResponseDto> {
    // Get quiz for maxAttempts
    const quiz = await this.quizAttemptRepository.findQuizByLessonId(lessonId);
    if (!quiz) {
      throw new NotFoundException('Quiz not found for this lesson');
    }

    // Get all attempts
    const attempts = await this.quizAttemptRepository.findUserAttempts(
      lessonId,
      userId,
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
      lessonId,
      userId,
    );

    // Count used attempts (SUBMITTED + EXPIRED)
    const usedAttempts = updatedAttempts.filter(
      (a) =>
        a.status === AttemptStatus.SUBMITTED ||
        a.status === AttemptStatus.EXPIRED,
    ).length;

    return {
      lessonId,
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
}
