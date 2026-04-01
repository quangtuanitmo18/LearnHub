import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getAllCategories(paginationQuery?: PaginationQueryDto) {
    return this.categoryRepository.findAll(paginationQuery);
  }

  async getAllCategoriesUnpaginated() {
    const categories = await this.categoryRepository.findMany(undefined, {
      createdAt: 'desc',
    });
    return { categories };
  }

  async getCategoryById(id: string) {
    const category = await this.categoryRepository.findOneOrNull({ id });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    // Check if name already exists
    const existingName = await this.categoryRepository.isNameExists(
      createCategoryDto.name,
    );
    if (existingName) {
      throw new BadRequestException('Category name already exists');
    }

    // Check if slug already exists
    const existingSlug = await this.categoryRepository.isSlugExists(
      createCategoryDto.slug,
    );
    if (existingSlug) {
      throw new BadRequestException('Category slug already exists');
    }

    return this.categoryRepository.create(createCategoryDto);
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    // Check if category exists
    const existingCategory = await this.categoryRepository.findOneOrNull({
      id,
    });
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    // Check if name already exists (excluding current category)
    if (updateCategoryDto.name) {
      const existingName = await this.categoryRepository.isNameExists(
        updateCategoryDto.name,
        id,
      );
      if (existingName) {
        throw new BadRequestException('Category name already exists');
      }
    }

    // Check if slug already exists (excluding current category)
    if (updateCategoryDto.slug) {
      const existingSlug = await this.categoryRepository.isSlugExists(
        updateCategoryDto.slug,
        id,
      );
      if (existingSlug) {
        throw new BadRequestException('Category slug already exists');
      }
    }

    return this.categoryRepository.update({ id }, updateCategoryDto);
  }

  async deleteCategory(id: string) {
    // Check if category exists
    const existingCategory = await this.categoryRepository.findOneOrNull({
      id,
    });
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    return this.categoryRepository.delete({ id });
  }

  async bulkDeleteCategories(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for deletion');
    }

    const result = await this.categoryRepository.bulkDelete(ids);

    if (result.count === 0) {
      throw new NotFoundException('No categories found with the provided IDs');
    }

    return {
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} ${result.count === 1 ? 'category' : 'categories'}`,
    };
  }
}
