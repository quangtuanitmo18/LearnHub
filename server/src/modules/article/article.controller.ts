import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { ArticleService } from './article.service';
import {
  CreateArticleDto,
  UpdateArticleDto,
  BulkDeleteArticleDto,
} from './dto/article.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';

@Controller('articles')
@UseGuards(PermissionGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Article created successfully')
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleService.createArticle(createArticleDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.COURSE_READ)
  @ResponseMessage('Articles retrieved successfully')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.articleService.getAllArticles(paginationQuery);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.COURSE_READ)
  @ResponseMessage('Article retrieved successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.articleService.getArticleById(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Article updated successfully')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articleService.updateArticle(id, updateArticleDto);
  }

  @Delete('bulk-delete')
  @RequirePermissions(PERMISSIONS.COURSE_DELETE)
  @ResponseMessage('Articles deleted successfully')
  bulkDelete(@Body() bulkDeleteDto: BulkDeleteArticleDto) {
    return this.articleService.bulkDeleteArticles(bulkDeleteDto.ids);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.COURSE_DELETE)
  @ResponseMessage('Article deleted successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.articleService.deleteArticle(id);
  }
}
