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
} from '@nestjs/common';
import { ChapterService } from './chapter.service';
import {
  CreateChapterDto,
  UpdateChapterDto,
  ReorderChaptersDto,
} from './dto/chapter.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';

@Controller('chapters')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post()
  @ResponseMessage('Chapter created successfully')
  create(@Body() createChapterDto: CreateChapterDto) {
    return this.chapterService.createChapter(createChapterDto);
  }

  @Get()
  @ResponseMessage('Chapters retrieved successfully')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.chapterService.getAllChapters(paginationQuery);
  }

  @Get('course/:courseId')
  @ResponseMessage('Course chapters retrieved successfully')
  findByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.chapterService.getChaptersByCourse(courseId);
  }

  @Get('course/:courseId/published')
  @ResponseMessage('Published course chapters retrieved successfully')
  findPublishedByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.chapterService.getPublishedChaptersByCourse(courseId);
  }

  @Get('course/:courseId/next-order')
  @ResponseMessage('Next order retrieved successfully')
  getNextOrder(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.chapterService.getNextOrderForCourse(courseId);
  }

  @Put('reorder')
  @ResponseMessage('Chapters reordered successfully')
  reorder(@Body() reorderDto: ReorderChaptersDto) {
    return this.chapterService.reorderChapters(reorderDto);
  }

  @Get(':id')
  @ResponseMessage('Chapter retrieved successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.chapterService.getChapterById(id);
  }

  @Put(':id')
  @ResponseMessage('Chapter updated successfully')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateChapterDto: UpdateChapterDto,
  ) {
    return this.chapterService.updateChapter(id, updateChapterDto);
  }

  @Put(':id/publish')
  @ResponseMessage('Chapter published successfully')
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.chapterService.publishChapter(id);
  }

  @Put(':id/unpublish')
  @ResponseMessage('Chapter unpublished successfully')
  unpublish(@Param('id', ParseUUIDPipe) id: string) {
    return this.chapterService.unpublishChapter(id);
  }

  @Delete(':id')
  @ResponseMessage('Chapter deleted successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.chapterService.deleteChapter(id);
  }
}
