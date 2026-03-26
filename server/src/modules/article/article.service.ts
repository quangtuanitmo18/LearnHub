import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { ArticleRepository } from './article.repository';

@Injectable()
export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async getAllArticles(paginationQuery?: PaginationQueryDto) {
    return this.articleRepository.findAll(paginationQuery);
  }

  async getArticleById(id: string) {
    const article = await this.articleRepository.findOneOrNull({ id });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async createArticle(createArticleDto: CreateArticleDto) {
    return this.articleRepository.create(createArticleDto);
  }

  async updateArticle(id: string, updateArticleDto: UpdateArticleDto) {
    // Check if article exists
    const existingArticle = await this.articleRepository.findOneOrNull({ id });
    if (!existingArticle) {
      throw new NotFoundException('Article not found');
    }

    return this.articleRepository.update({ id }, updateArticleDto);
  }

  async deleteArticle(id: string) {
    // Check if article exists
    const existingArticle = await this.articleRepository.findOneOrNull({ id });
    if (!existingArticle) {
      throw new NotFoundException('Article not found');
    }

    return this.articleRepository.delete({ id });
  }

  async bulkDeleteArticles(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for deletion');
    }

    const result = await this.articleRepository.bulkDelete(ids);

    if (result.count === 0) {
      throw new NotFoundException('No articles found with the provided IDs');
    }

    return {
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} ${result.count === 1 ? 'article' : 'articles'}`,
    };
  }
}
