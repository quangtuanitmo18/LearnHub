import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserLessonProgressRepository } from './user-lesson-progress.repository';
import { LessonRepository } from '../lesson/lesson.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class UserLessonProgressService {
  constructor(
    private readonly userLessonProgressRepository: UserLessonProgressRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async toggleProgress(userId: string, lessonId: string): Promise<any> {
    const lesson = await this.lessonRepository.findOneOrNull({ id: lessonId });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    const user = await this.userRepository.findOneOrNull({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.userLessonProgressRepository.toggleProgress(
      userId,
      lessonId,
      lesson.courseId,
    );
  }

  /**
   * Update lesson progress
   */
  /**
   * Get progress by ID
   */
  async getProgressById(progressId: string, userId?: string): Promise<any> {
    const progress = await this.userLessonProgressRepository.findOne({
      id: progressId,
    });

    // If userId is provided, verify ownership for non-admin users
    // Note: findOne throws NotFoundException if not found, so progress is never null here
    if (userId && progress!.userId !== userId) {
      const user = await this.userRepository.findByIdWithRoles(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isAdmin = user.roles.some(
        (role) => role.name === 'Admin' || role.name === 'Super Admin',
      );

      if (!isAdmin) {
        throw new ForbiddenException(
          'You can only view your own lesson progress',
        );
      }
    }

    return progress;
  }

  /**
   * Get progress by user and lesson
   */
  async getProgressByUserAndLesson(
    userId: string,
    lessonId: string,
  ): Promise<any> {
    const lesson = await this.lessonRepository.findOneOrNull({
      id: lessonId,
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return this.userLessonProgressRepository.findByUserAndLesson(
      userId,
      lessonId,
    );
  }

  /**
   * Get all progress items for a user within a course
   */
  async getProgressByUserAndCourse(userId: string, courseId: string) {
    return this.userLessonProgressRepository.findManyByUserAndCourse(
      userId,
      courseId,
    );
  }
}
