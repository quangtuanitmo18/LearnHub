import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { CategoryService } from './category.service';
import {
  BulkDeleteCategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';

@Controller('categories')
@UseGuards(PermissionGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('all')
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // 5 minutes
  @ResponseMessage('All categories retrieved successfully')
  async getAllCategoriesUnpaginated() {
    return this.categoryService.getAllCategoriesUnpaginated();
  }

  @Get()
  @RequirePermissions(PERMISSIONS.CATEGORY_READ)
  @ResponseMessage('Categories retrieved successfully')
  async getAllCategories(@Query() paginationQuery: PaginationQueryDto) {
    return this.categoryService.getAllCategories(paginationQuery);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.CATEGORY_READ)
  @ResponseMessage('Category retrieved successfully')
  async getCategoryById(@Param('id') id: string) {
    return this.categoryService.getCategoryById(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CATEGORY_CREATE)
  @ResponseMessage('Category created successfully')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.CATEGORY_UPDATE)
  @ResponseMessage('Category updated successfully')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }

  @Delete('bulk-delete')
  @RequirePermissions(PERMISSIONS.CATEGORY_DELETE)
  @ResponseMessage('Categories deleted successfully')
  async bulkDeleteCategories(@Body() bulkDeleteDto: BulkDeleteCategoryDto) {
    return this.categoryService.bulkDeleteCategories(bulkDeleteDto.ids);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.CATEGORY_DELETE)
  @ResponseMessage('Category deleted successfully')
  async deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
