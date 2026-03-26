import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateChapterDto,
  UpdateChapterDto,
  ReorderChaptersDto,
} from './dto/chapter.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { ChapterRepository } from './chapter.repository';
import { CourseRepository } from '../course/course.repository';

@Injectable()
export class ChapterService {
  constructor(
    private readonly chapterRepository: ChapterRepository,
    private readonly courseRepository: CourseRepository,
  ) { }

  async getAllChapters(paginationQuery?: PaginationQueryDto) {
    return this.chapterRepository.findAll(paginationQuery);
  }

  async getChaptersByCourse(courseId: string) {
    // Check if course exists
    const course = await this.courseRepository.findOneOrNull({ id: courseId });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return this.chapterRepository.findOrderedByCourse(courseId);
  }

  async getPublishedChaptersByCourse(courseId: string) {
    // Check if course exists
    const course = await this.courseRepository.findOneOrNull({ id: courseId });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    const chapters =
      await this.chapterRepository.findPublishedByCourse(courseId);

    // Add totalLessons and totalDuration for each chapter
    const chaptersWithStats = await Promise.all(
      chapters.map(async (chapter: any) => {
        const [totalLessons, totalDuration] = await Promise.all([
          this.chapterRepository.getTotalLessons(chapter.id),
          this.chapterRepository.getTotalDuration(chapter.id),
        ]);

        return {
          ...chapter,
          totalLessons,
          totalDuration,
        };
      }),
    );

    return chaptersWithStats;
  }

  async getChapterById(id: string) {
    const chapter = await this.chapterRepository.findOneOrNull({ id });
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }
    return chapter;
  }

  async createChapter(createChapterDto: CreateChapterDto) {
    // Validate course exists
    const course = await this.courseRepository.findOneOrNull({
      id: createChapterDto.courseId,
    });
    if (!course) {
      throw new BadRequestException('Course not found');
    }

    // Always auto-assign the next order number
    const nextOrder = await this.chapterRepository.getNextOrder(
      createChapterDto.courseId,
    );

    return this.chapterRepository.create({
      ...createChapterDto,
      order: nextOrder,
    } as any);
  }

  async updateChapter(id: string, updateChapterDto: UpdateChapterDto) {
    // Check if chapter exists
    const existingChapter = await this.chapterRepository.findOneOrNull({ id });
    if (!existingChapter) {
      throw new NotFoundException('Chapter not found');
    }

    // Validate course if provided
    if (updateChapterDto.courseId) {
      const course = await this.courseRepository.findOneOrNull({
        id: updateChapterDto.courseId,
      });
      if (!course) {
        throw new BadRequestException('Course not found');
      }
    }

    // Check if order already exists (excluding current chapter)
    if (updateChapterDto.order !== undefined) {
      const courseId = updateChapterDto.courseId || existingChapter.courseId;
      const orderExists = await this.chapterRepository.isOrderExists(
        courseId,
        updateChapterDto.order,
        id,
      );
      if (orderExists) {
        // Reorder existing chapters to make space
        await this.chapterRepository.reorderChapters(
          courseId,
          updateChapterDto.order,
        );
      }
    }

    return this.chapterRepository.update({ id }, updateChapterDto);
  }

  async deleteChapter(id: string) {
    // Check if chapter exists
    const existingChapter = await this.chapterRepository.findOneOrNull({ id });
    if (!existingChapter) {
      throw new NotFoundException('Chapter not found');
    }

    return this.chapterRepository.delete({ id });
  }

  async publishChapter(id: string) {
    const chapter = await this.chapterRepository.findOneOrNull({ id });
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    return this.chapterRepository.update({ id }, { isPublished: true });
  }

  async unpublishChapter(id: string) {
    const chapter = await this.chapterRepository.findOneOrNull({ id });
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    return this.chapterRepository.update({ id }, { isPublished: false });
  }

  async getNextOrderForCourse(courseId: string) {
    // Check if course exists
    const course = await this.courseRepository.findOneOrNull({ id: courseId });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.chapterRepository.getNextOrder(courseId);
  }

  async reorderChapters(reorderDto: ReorderChaptersDto) {
    const { chapters } = reorderDto;

    // Validate all chapters exist
    const chapterIds = chapters.map((c) => c.id);
    const existingChapters = await Promise.all(
      chapterIds.map((id) => this.chapterRepository.findOneOrNull({ id })),
    );

    const notFound = existingChapters.findIndex((chapter) => !chapter);
    if (notFound !== -1) {
      throw new NotFoundException(
        `Chapter with id ${chapterIds[notFound]} not found`,
      );
    }

    // Update all chapter orders in a transaction
    await this.chapterRepository.bulkUpdateOrders(chapters);

    return { message: 'Chapters reordered successfully' };
  }
}
