import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateLessonDto,
  UpdateLessonDto,
  ReorderLessonsDto,
  QuizContentDto,
  QuizQuestionDto,
  ArticleContentDto,
  VideoContentDto,
} from './dto/lesson.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { LessonRepository } from './lesson.repository';
import { CourseRepository } from '../course/course.repository';
import { ChapterRepository } from '../chapter/chapter.repository';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  LessonType,
  QuestionType,
} from 'src/shared/constants/lesson.constant';

@Injectable()
export class LessonService {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly courseRepository: CourseRepository,
    private readonly chapterRepository: ChapterRepository,
    private readonly prismaService: PrismaService,
  ) {}

  // ============ READ OPERATIONS ============

  async getAllLessons(paginationQuery?: PaginationQueryDto) {
    return this.lessonRepository.findAll(paginationQuery);
  }


  async getLessonsByChapter(chapterId: string) {
    const chapter = await this.chapterRepository.findOneOrNull({
      id: chapterId,
    });
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }
    return this.lessonRepository.findByChapter(chapterId);
  }


  async getPublishedLessonsByChapter(chapterId: string) {
    const chapter = await this.chapterRepository.findOneOrNull({
      id: chapterId,
    });
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }
    return this.lessonRepository.findPublishedByChapter(chapterId);
  }


  async getLessonById(id: string) {
    const lesson = await this.lessonRepository.findWithContent({ id });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson;
  }


  // ============ CREATE OPERATIONS ============

  async createLesson(dto: CreateLessonDto) {
    // Validate course exists
    const course = await this.courseRepository.findOneOrNull({
      id: dto.courseId,
    });
    if (!course) {
      throw new BadRequestException('Course not found');
    }

    // Validate chapter exists and belongs to the course
    const chapter = await this.chapterRepository.findOneOrNull({
      id: dto.chapterId,
    });
    if (!chapter) {
      throw new BadRequestException('Chapter not found');
    }
    if (chapter.courseId !== dto.courseId) {
      throw new BadRequestException(
        'Chapter does not belong to the specified course',
      );
    }

    // Validate slug uniqueness if provided
    if (dto.lesson.slug) {
      const isUnique = await this.lessonRepository.isSlugUnique(
        dto.lesson.slug,
      );
      if (!isUnique) {
        throw new BadRequestException('Slug already exists');
      }
    }

    // Get order number (use provided or auto-calculate next)
    const orderToUse =
      dto.lesson.order ??
      (await this.lessonRepository.getNextOrder(dto.chapterId));

    // Route to specific handler based on lesson type
    switch (dto.lesson.type) {
      case LessonType.ARTICLE:
        return this.createArticleLesson(dto, orderToUse);
      case LessonType.VIDEO:
        return this.createVideoLesson(dto, orderToUse);
      case LessonType.QUIZ:
        return this.createQuizLesson(dto, orderToUse);
      default:
        throw new BadRequestException(
          `Unsupported lesson type: ${dto.lesson.type}`,
        );
    }
  }

  private async createArticleLesson(dto: CreateLessonDto, order: number) {
    const content = dto.content as ArticleContentDto;

    // Validate article content
    if (!content.content || content.content.trim() === '') {
      throw new BadRequestException('Article content is required');
    }

    return this.prismaService.$transaction(async (tx) => {
      // Create lesson with article relation
      const lesson = await tx.lesson.create({
        data: {
          type: LessonType.ARTICLE,
          title: dto.lesson.title,
          description: dto.lesson.description,
          slug: dto.lesson.slug,
          order,
          published: dto.lesson.published ?? false,
          durationSec: content.durationSec,
          courseId: dto.courseId,
          chapterId: dto.chapterId,
          article: {
            create: {
              content: content.content,
              durationSec: content.durationSec,
            },
          },
        },
        include: {
          article: true,
          course: {
            select: { id: true, title: true, slug: true },
          },
          chapter: {
            select: { id: true, title: true, order: true },
          },
        },
      });

      return lesson;
    });
  }

  private async createVideoLesson(dto: CreateLessonDto, order: number) {
    const content = dto.content as VideoContentDto;

    // Validate video content
    if (!content.url || content.url.trim() === '') {
      throw new BadRequestException('Video URL is required');
    }

    return this.prismaService.$transaction(async (tx) => {
      // Create lesson with video relation
      const lesson = await tx.lesson.create({
        data: {
          type: LessonType.VIDEO,
          title: dto.lesson.title,
          description: dto.lesson.description,
          slug: dto.lesson.slug,
          order,
          published: dto.lesson.published ?? false,
          durationSec: content.durationSec,
          courseId: dto.courseId,
          chapterId: dto.chapterId,
          video: {
            create: {
              url: content.url,
              durationSec: content.durationSec,
            },
          },
        },
        include: {
          video: true,
          course: {
            select: { id: true, title: true, slug: true },
          },
          chapter: {
            select: { id: true, title: true, order: true },
          },
        },
      });

      return lesson;
    });
  }

  private async createQuizLesson(dto: CreateLessonDto, order: number) {
    const content = dto.content as QuizContentDto;

    // Validate quiz content
    if (!content.questions || content.questions.length === 0) {
      throw new BadRequestException('Quiz must have at least one question');
    }

    // Validate each question based on its type
    for (const question of content.questions) {
      this.validateQuizQuestion(question);
    }

    const result = await this.prismaService.$transaction(async (tx) => {
      // Step 1: Create Lesson + LessonQuiz
      const lesson = await tx.lesson.create({
        data: {
          type: LessonType.QUIZ,
          title: dto.lesson.title,
          description: dto.lesson.description,
          slug: dto.lesson.slug,
          order,
          published: dto.lesson.published ?? false,
          durationSec: content.durationSec,
          courseId: dto.courseId,
          chapterId: dto.chapterId,
          quiz: {
            create: {
              durationSec: content.durationSec,
              passScore: content.passScore,
              maxAttempts: content.maxAttempts,
            },
          },
        },
        include: {
          quiz: true,
          course: {
            select: { id: true, title: true, slug: true },
          },
          chapter: {
            select: { id: true, title: true, order: true },
          },
        },
      });

      // Step 2: Create questions with options (including isCorrect)
      for (const questionDto of content.questions) {
        await tx.quizQuestion.create({
          data: {
            quizId: lesson.id,
            type: questionDto.type,
            text: questionDto.text,
            explanation: questionDto.explanation,
            order: questionDto.order ?? 0,
            points: questionDto.points ?? 1,
            options: {
              create: questionDto.options.map((opt) => ({
                text: opt.text,
                order: opt.order ?? 0,
                isCorrect: opt.isCorrect,
              })),
            },
          },
        });
      }

      // Fetch the complete lesson with all relations
      const fullLesson = await tx.lesson.findUnique({
        where: { id: lesson.id },
        include: {
          quiz: {
            include: {
              questions: {
                orderBy: { order: 'asc' },
                include: {
                  options: { orderBy: { order: 'asc' } },
                },
              },
            },
          },
          course: {
            select: { id: true, title: true, slug: true },
          },
          chapter: {
            select: { id: true, title: true, order: true },
          },
        },
      });

      return fullLesson;
    });

    return result;
  }

  private validateQuizQuestion(question: QuizQuestionDto): void {
    const { type, options } = question;
    const correctOptions = options.filter((o) => o.isCorrect);

    switch (type) {
      case QuestionType.TRUE_FALSE:
        if (options.length !== 2) {
          throw new BadRequestException(
            `TRUE_FALSE question "${question.text}" must have exactly 2 options`,
          );
        }
        if (correctOptions.length !== 1) {
          throw new BadRequestException(
            `TRUE_FALSE question "${question.text}" must have exactly 1 correct answer`,
          );
        }
        break;

      case QuestionType.SINGLE_CHOICE:
        if (options.length < 2) {
          throw new BadRequestException(
            `SINGLE_CHOICE question "${question.text}" must have at least 2 options`,
          );
        }
        if (correctOptions.length !== 1) {
          throw new BadRequestException(
            `SINGLE_CHOICE question "${question.text}" must have exactly 1 correct answer`,
          );
        }
        break;

      case QuestionType.MULTIPLE_CHOICE:
        if (options.length < 2) {
          throw new BadRequestException(
            `MULTIPLE_CHOICE question "${question.text}" must have at least 2 options`,
          );
        }
        if (correctOptions.length < 1) {
          throw new BadRequestException(
            `MULTIPLE_CHOICE question "${question.text}" must have at least 1 correct answer`,
          );
        }
        break;

      default:
        throw new BadRequestException(`Unknown question type: ${type}`);
    }
  }

  // ============ UPDATE OPERATIONS ============

  async updateLesson(id: string, dto: UpdateLessonDto) {
    // Check if lesson exists
    const existingLesson = await this.lessonRepository.findOneOrNull({ id });
    if (!existingLesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Validate course if provided
    if (dto.courseId) {
      const course = await this.courseRepository.findOneOrNull({
        id: dto.courseId,
      });
      if (!course) {
        throw new BadRequestException('Course not found');
      }
    }

    // Validate chapter if provided
    if (dto.chapterId) {
      const chapter = await this.chapterRepository.findOneOrNull({
        id: dto.chapterId,
      });
      if (!chapter) {
        throw new BadRequestException('Chapter not found');
      }

      // Validate chapter belongs to course
      const courseId = dto.courseId || existingLesson.courseId;
      if (chapter.courseId !== courseId) {
        throw new BadRequestException(
          'Chapter does not belong to the specified course',
        );
      }
    }

    // Validate slug uniqueness if provided
    if (dto.lesson?.slug) {
      const isUnique = await this.lessonRepository.isSlugUnique(
        dto.lesson.slug,
        id,
      );
      if (!isUnique) {
        throw new BadRequestException('Slug already exists');
      }
    }
    console.log('UpdateLessonDto1:', dto.content);
    return this.prismaService.$transaction(async (tx) => {
      // Update lesson base fields
      const updateData: any = {
        ...(dto.lesson?.title && { title: dto.lesson.title }),
        ...(dto.lesson?.description !== undefined && {
          description: dto.lesson.description,
        }),
        ...(dto.lesson?.slug !== undefined && { slug: dto.lesson.slug }),
        ...(dto.lesson?.order !== undefined && { order: dto.lesson.order }),
        ...(dto.lesson?.published !== undefined && {
          published: dto.lesson.published,
        }),
        ...(dto.courseId && { courseId: dto.courseId }),
        ...(dto.chapterId && { chapterId: dto.chapterId }),
      };
      console.log('UpdateLessonDto2:', updateData);

      // Update durationSec if content with duration is provided
      if (dto.content && Object.keys(dto.content).length > 0) {
        const content = dto.content as any;
        if (content.durationSec !== undefined) {
          updateData.durationSec = content.durationSec;
        }
      }

      const updatedLesson = await tx.lesson.update({
        where: { id },
        data: updateData,
      });

      // Update content based on lesson type
      if (dto.content && Object.keys(dto.content).length > 0) {
        switch (existingLesson.type) {
          case LessonType.ARTICLE:
            await tx.lessonArticle.update({
              where: { lessonId: id },
              data: dto.content as any,
            });
            break;
          case LessonType.VIDEO:
            await tx.lessonVideo.update({
              where: { lessonId: id },
              data: dto.content as any,
            });
            break;
          case LessonType.QUIZ:
            await this.updateQuizContent(tx, id, dto.content as any);
            break;
        }
      }

      // Fetch and return updated lesson with content
      return tx.lesson.findUnique({
        where: { id },
        include: {
          article: true,
          video: true,
          quiz: {
            include: {
              questions: {
                orderBy: { order: 'asc' },
                include: {
                  options: { orderBy: { order: 'asc' } },
                },
              },
            },
          },
          course: {
            select: { id: true, title: true, slug: true },
          },
          chapter: {
            select: { id: true, title: true, order: true },
          },
        },
      });
    });
  }

  private async updateQuizContent(tx: any, lessonId: string, content: any) {
    // Update quiz settings
    await tx.lessonQuiz.update({
      where: { lessonId },
      data: {
        ...(content.durationSec !== undefined && {
          durationSec: content.durationSec,
        }),
        ...(content.passScore !== undefined && {
          passScore: content.passScore,
        }),
        ...(content.maxAttempts !== undefined && {
          maxAttempts: content.maxAttempts,
        }),
      },
    });

    // If questions are provided, replace all questions
    if (content.questions && content.questions.length > 0) {
      // Delete existing questions (cascades to options)
      await tx.quizQuestion.deleteMany({
        where: { quizId: lessonId },
      });

      // Create new questions with options
      for (const questionDto of content.questions) {
        this.validateQuizQuestion(questionDto);

        await tx.quizQuestion.create({
          data: {
            quizId: lessonId,
            type: questionDto.type,
            text: questionDto.text,
            explanation: questionDto.explanation,
            order: questionDto.order ?? 0,
            points: questionDto.points ?? 1,
            options: {
              create: questionDto.options.map((opt: any) => ({
                text: opt.text,
                order: opt.order ?? 0,
                isCorrect: opt.isCorrect,
              })),
            },
          },
        });
      }
    }
  }

  // ============ DELETE OPERATIONS ============

  async deleteLesson(id: string) {
    const existingLesson = await this.lessonRepository.findOneOrNull({ id });
    if (!existingLesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Prisma cascade will handle related records (article, video, quiz, questions, options)
    return this.lessonRepository.delete({ id });
  }


  // ============ REORDER OPERATIONS ============

  async reorderLessons(reorderDto: ReorderLessonsDto) {
    const { lessons } = reorderDto;

    // Validate all lessons exist
    const lessonIds = lessons.map((l) => l.id);
    const existingLessons = await Promise.all(
      lessonIds.map((id) => this.lessonRepository.findOneOrNull({ id })),
    );

    const notFound = existingLessons.findIndex((lesson) => !lesson);
    if (notFound !== -1) {
      throw new NotFoundException(
        `Lesson with id ${lessonIds[notFound]} not found`,
      );
    }

    // Update all lesson orders in a transaction
    await this.lessonRepository.bulkUpdateOrders(lessons);

    return { message: 'Lessons reordered successfully' };
  }
}
