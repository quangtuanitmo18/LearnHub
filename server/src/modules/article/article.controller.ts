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
} from '@nestjs/common';
import { ArticleService } from './article.service';
import {
  CreateArticleDto,
  UpdateArticleDto,
  BulkDeleteArticleDto,
} from './dto/article.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @ResponseMessage('Article created successfully')
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleService.createArticle(createArticleDto);
  }

  @Get()
  @ResponseMessage('Articles retrieved successfully')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.articleService.getAllArticles(paginationQuery);
  }

  @Get(':id')
  @ResponseMessage('Article retrieved successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.articleService.getArticleById(id);
  }

  @Patch(':id')
  @ResponseMessage('Article updated successfully')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articleService.updateArticle(id, updateArticleDto);
  }

  @Delete('bulk-delete')
  @ResponseMessage('Articles deleted successfully')
  bulkDelete(@Body() bulkDeleteDto: BulkDeleteArticleDto) {
    return this.articleService.bulkDeleteArticles(bulkDeleteDto.ids);
  }

  @Delete(':id')
  @ResponseMessage('Article deleted successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.articleService.deleteArticle(id);
  }
}
