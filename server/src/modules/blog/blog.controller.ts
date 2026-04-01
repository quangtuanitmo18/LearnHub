import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { Public } from 'src/shared/decorators/public.decorator';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { BlogService } from './blog.service';
import {
  CreateBlogDto,
  UpdateBlogDto,
  BlogQueryDto,
  BulkDeleteBlogDto,
} from './dto/blog.dto';

@Controller('blogs')
@UseGuards(PermissionGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.BLOG_READ)
  @ResponseMessage('Blogs retrieved successfully')
  async getAllBlogs(@Query() blogQuery: BlogQueryDto) {
    return this.blogService.getAllBlogs(blogQuery);
  }

  @Get('all')
  @Public()
  @ResponseMessage('All blogs retrieved successfully')
  async getAllBlogsUnpaginated() {
    return this.blogService.getAllBlogsUnpaginated();
  }

  @Get('published')
  @Public()
  @ResponseMessage('Published blogs retrieved successfully')
  async getPublishedBlogs(@Query() paginationQuery: PaginationQueryDto) {
    return this.blogService.getPublishedBlogs(paginationQuery);
  }

  @Get('slug/:slug')
  @Public()
  @ResponseMessage('Blog retrieved successfully')
  async getBlogBySlug(@Param('slug') slug: string) {
    return this.blogService.getBlogBySlug(slug);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.BLOG_READ)
  @ResponseMessage('Blog retrieved successfully')
  async getBlogById(@Param('id') id: string) {
    return this.blogService.getBlogById(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.BLOG_CREATE)
  @ResponseMessage('Blog created successfully')
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.blogService.createBlog(createBlogDto, userId);
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.BLOG_UPDATE)
  @ResponseMessage('Blog updated successfully')
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogService.updateBlog(id, updateBlogDto);
  }

  @Delete('bulk-delete')
  @RequirePermissions(PERMISSIONS.BLOG_DELETE)
  @ResponseMessage('Blogs deleted successfully')
  async bulkDeleteBlogs(@Body() bulkDeleteDto: BulkDeleteBlogDto) {
    return this.blogService.bulkDeleteBlogs(bulkDeleteDto.ids);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.BLOG_DELETE)
  @ResponseMessage('Blog deleted successfully')
  async deleteBlog(@Param('id') id: string) {
    return this.blogService.deleteBlog(id);
  }
}
