import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class QuizQuestionService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly quizInclude = {
    questions: {
      orderBy: { order: 'asc' as const },
      include: {
        options: { orderBy: { order: 'asc' as const } },
      },
    },
  };

  async getQuizByLesson(lessonId: string) {
    const quiz = await this.prismaService.lessonQuiz.findUnique({
      where: { lessonId },
      include: this.quizInclude,
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found for this lesson');
    }
    return quiz;
  }

  async getQuizById(id: string) {
    const quiz = await this.prismaService.lessonQuiz.findUnique({
      where: { lessonId: id },
      include: this.quizInclude,
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  createQuiz(questions: any[]) {
    // This is handled by lesson creation
    // Return empty for now - quiz creation goes through lesson CRUD
    return { message: 'Use lesson creation API to create quizzes' };
  }

  async updateQuizQuestions(quizId: string, questions: any[]) {
    // Delete existing questions
    await this.prismaService.quizQuestion.deleteMany({
      where: { quizId },
    });

    // Create new questions
    for (const q of questions) {
      await this.prismaService.quizQuestion.create({
        data: {
          quizId,
          type: q.type,
          text: q.text,
          explanation: q.explanation,
          order: q.order ?? 0,
          points: q.points ?? 1,
          options: {
            create: (q.options || []).map((opt: any) => ({
              text: opt.text,
              order: opt.order ?? 0,
              isCorrect: opt.isCorrect,
            })),
          },
        },
      });
    }

    return this.getQuizById(quizId);
  }

  async deleteQuiz(id: string) {
    // Delete all questions first (cascade should handle this)
    await this.prismaService.quizQuestion.deleteMany({
      where: { quizId: id },
    });
    await this.prismaService.lessonQuiz.delete({
      where: { lessonId: id },
    });
    return { message: 'Quiz deleted successfully' };
  }

  async setPublishStatus(id: string, published: boolean) {
    const lesson = await this.prismaService.lesson.update({
      where: { id },
      data: { published },
      include: {
        quiz: { include: this.quizInclude },
      },
    });
    return lesson;
  }

  async addQuestion(quizId: string, question: any) {
    const created = await this.prismaService.quizQuestion.create({
      data: {
        quizId,
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
      include: {
        options: { orderBy: { order: 'asc' } },
      },
    });
    return created;
  }

  async updateQuestion(quizId: string, questionId: string, question: any) {
    // Delete old options
    await this.prismaService.quizOption.deleteMany({
      where: { questionId },
    });

    // Update question and recreate options
    const updated = await this.prismaService.quizQuestion.update({
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
      include: {
        options: { orderBy: { order: 'asc' } },
      },
    });
    return updated;
  }

  async deleteQuestion(quizId: string, questionId: string) {
    await this.prismaService.quizQuestion.delete({
      where: { id: questionId },
    });
    return { message: 'Question deleted successfully' };
  }

  async reorderQuestions(quizId: string, questionIds: string[]) {
    for (let i = 0; i < questionIds.length; i++) {
      await this.prismaService.quizQuestion.update({
        where: { id: questionIds[i] },
        data: { order: i },
      });
    }
    return this.getQuizById(quizId);
  }
}
