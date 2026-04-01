import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { ChapterService } from './chapter.service';
import {
  CreateChapterDto,
  UpdateChapterDto,
  ReorderChaptersDto,
} from './dto/chapter.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';

@Controller('chapters')
@UseGuards(PermissionGuard)
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Chapter created successfully')
  create(@Body() createChapterDto: CreateChapterDto) {
    return this.chapterService.createChapter(createChapterDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.COURSE_READ)
  @ResponseMessage('Chapters retrieved successfully')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.chapterService.getAllChapters(paginationQuery);
  }

  @Get('course/:courseId')
  @RequirePermissions(PERMISSIONS.COURSE_READ)
  @ResponseMessage('Course chapters retrieved successfully')
  findByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.chapterService.getChaptersByCourse(courseId);
  }

  @Get('course/:courseId/published')
  @Public()
  @ResponseMessage('Published course chapters retrieved successfully')
  findPublishedByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.chapterService.getPublishedChaptersByCourse(courseId);
  }

  @Get('course/:courseId/next-order')
  @RequirePermissions(PERMISSIONS.COURSE_READ)
  @ResponseMessage('Next order retrieved successfully')
  getNextOrder(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.chapterService.getNextOrderForCourse(courseId);
  }

  @Put('reorder')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Chapters reordered successfully')
  reorder(@Body() reorderDto: ReorderChaptersDto) {
    return this.chapterService.reorderChapters(reorderDto);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.COURSE_READ)
  @ResponseMessage('Chapter retrieved successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.chapterService.getChapterById(id);
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Chapter updated successfully')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateChapterDto: UpdateChapterDto,
  ) {
    return this.chapterService.updateChapter(id, updateChapterDto);
  }

  @Put(':id/publish')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Chapter published successfully')
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.chapterService.publishChapter(id);
  }

  @Put(':id/unpublish')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Chapter unpublished successfully')
  unpublish(@Param('id', ParseUUIDPipe) id: string) {
    return this.chapterService.unpublishChapter(id);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.COURSE_DELETE)
  @ResponseMessage('Chapter deleted successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.chapterService.deleteChapter(id);
  }
}
