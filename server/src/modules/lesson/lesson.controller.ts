import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { UserLessonProgressService } from '../user-lesson-progress/user-lesson-progress.service';
import {
  CreateLessonDto,
  ReorderLessonsDto,
  UpdateLessonDto,
} from './dto/lesson.dto';
import { LessonService } from './lesson.service';

@Controller('lessons')
@UseGuards(PermissionGuard)
export class LessonController {
  constructor(
    private readonly lessonService: LessonService,
    private readonly userLessonProgressService: UserLessonProgressService,
  ) {}

  @Post()
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Lesson created successfully')
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonService.createLesson(createLessonDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.COURSE_READ)
  @ResponseMessage('Lessons retrieved successfully')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.lessonService.getAllLessons(paginationQuery);
  }

  @Get('chapter/:chapterId')
  @RequirePermissions(PERMISSIONS.COURSE_READ)
  @ResponseMessage('Chapter lessons retrieved successfully')
  findByChapter(@Param('chapterId') chapterId: string) {
    return this.lessonService.getLessonsByChapter(chapterId);
  }

  @Get('chapter/:chapterId/published')
  @Public()
  @ResponseMessage('Published chapter lessons retrieved successfully')
  findPublishedByChapter(@Param('chapterId') chapterId: string) {
    return this.lessonService.getPublishedLessonsByChapter(chapterId);
  }

  @Put('reorder')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Lessons reordered successfully')
  reorder(@Body() reorderDto: ReorderLessonsDto) {
    return this.lessonService.reorderLessons(reorderDto);
  }

  @Get('slug/:slug')
  @Public()
  @ResponseMessage('Lesson retrieved successfully')
  findBySlug(@Param('slug') slug: string) {
    return this.lessonService.getLessonBySlug(slug);
  }

  @Patch(':id/toggle-publish')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Lesson publish status toggled successfully')
  togglePublish(@Param('id') id: string) {
    return this.lessonService.togglePublish(id);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.COURSE_READ)
  @ResponseMessage('Lesson retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.lessonService.getLessonById(id);
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Lesson updated successfully')
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonService.updateLesson(id, updateLessonDto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.COURSE_DELETE)
  @ResponseMessage('Lesson deleted successfully')
  remove(@Param('id') id: string) {
    return this.lessonService.deleteLesson(id);
  }

  @Post(':lessonId/progress/toggle')
  @ResponseMessage('Lesson progress toggled successfully')
  async toggleProgress(
    @Param('lessonId') lessonId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.userLessonProgressService.toggleProgress(userId, lessonId);
  }

  @Get(':lessonId/progress')
  @ResponseMessage('Lesson progress retrieved successfully')
  async getProgressByLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.userLessonProgressService.getProgressByUserAndLesson(
      userId,
      lessonId,
    );
  }
}

