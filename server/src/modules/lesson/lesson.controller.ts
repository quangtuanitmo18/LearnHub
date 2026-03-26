import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import {
  CreateLessonDto,
  UpdateLessonDto,
  ReorderLessonsDto,
} from './dto/lesson.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { UserLessonProgressService } from '../user-lesson-progress/user-lesson-progress.service';

@Controller('lessons')
export class LessonController {
  constructor(
    private readonly lessonService: LessonService,
    private readonly userLessonProgressService: UserLessonProgressService,
  ) { }

  @Post()
  @ResponseMessage('Lesson created successfully')
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonService.createLesson(createLessonDto);
  }

  @Get()
  @ResponseMessage('Lessons retrieved successfully')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.lessonService.getAllLessons(paginationQuery);
  }

  @Get('chapter/:chapterId')
  @ResponseMessage('Chapter lessons retrieved successfully')
  findByChapter(@Param('chapterId') chapterId: string) {
    return this.lessonService.getLessonsByChapter(chapterId);
  }

  @Get('chapter/:chapterId/published')
  @ResponseMessage('Published chapter lessons retrieved successfully')
  findPublishedByChapter(@Param('chapterId') chapterId: string) {
    return this.lessonService.getPublishedLessonsByChapter(chapterId);
  }

  @Put('reorder')
  @ResponseMessage('Lessons reordered successfully')
  reorder(@Body() reorderDto: ReorderLessonsDto) {
    return this.lessonService.reorderLessons(reorderDto);
  }

  @Get(':id')
  @ResponseMessage('Lesson retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.lessonService.getLessonById(id);
  }

  @Put(':id')
  @ResponseMessage('Lesson updated successfully')
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonService.updateLesson(id, updateLessonDto);
  }

  @Delete(':id')
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
