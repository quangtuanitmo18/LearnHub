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
} from '@nestjs/common';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { CourseService } from './course.service';
import { UserLessonProgressService } from '../user-lesson-progress/user-lesson-progress.service';
import {
  BulkDeleteCourseDto,
  CourseQueryDto,
  CreateCourseDto,
  PublicCourseQueryDto,
  UpdateCourseDto,
} from './dto/course.dto';

@Controller('courses')
@UseGuards(PermissionGuard)
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly userLessonProgressService: UserLessonProgressService,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.COURSE_READ)
  @ResponseMessage('Courses retrieved successfully')
  async getAllCourses(@Query() courseQuery: CourseQueryDto) {
    return this.courseService.getAllCourses(courseQuery);
  }

  @Get('published')
  @Public()
  @ResponseMessage('Published courses retrieved successfully')
  async getPublishedCourses(@Query() publicQuery: PublicCourseQueryDto) {
    return this.courseService.getPublishedCourses(publicQuery);
  }

  @Get('my-courses')
  @RequirePermissions(PERMISSIONS.COURSE_READ)
  @ResponseMessage('My courses retrieved successfully')
  async getMyCourses(@CurrentUser('sub') userId: string) {
    return await this.courseService.getMyCourses(userId);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.COURSE_READ)
  @ResponseMessage('Course retrieved successfully')
  async getCourseById(@Param('id') id: string) {
    return this.courseService.getCourseById(id);
  }

  @Get('slug/:slug')
  @Public()
  @ResponseMessage('Course retrieved successfully')
  async getCourseBySlug(@Param('slug') slug: string) {
    return this.courseService.getCourseBySlug(slug);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.COURSE_CREATE)
  @ResponseMessage('Course created successfully')
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.courseService.createCourse(createCourseDto, userId);
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Course updated successfully')
  async updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.courseService.updateCourse(id, updateCourseDto);
  }

  @Delete('bulk-delete')
  @RequirePermissions(PERMISSIONS.COURSE_DELETE)
  @ResponseMessage('Courses deleted successfully')
  async bulkDeleteCourses(@Body() bulkDeleteDto: BulkDeleteCourseDto) {
    return this.courseService.bulkDeleteCourses(bulkDeleteDto.ids);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.COURSE_DELETE)
  @ResponseMessage('Course deleted successfully')
  async deleteCourse(@Param('id') id: string) {
    return this.courseService.deleteCourse(id);
  }

  @Put(':id/increment-views')
  @Public()
  @ResponseMessage('Course views incremented successfully')
  async incrementCourseViews(@Param('id') id: string) {
    return this.courseService.incrementCourseViews(id);
  }

  @Put(':id/increment-sold')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Course sold count incremented successfully')
  async incrementCourseSold(@Param('id') id: string) {
    return this.courseService.incrementCourseSold(id);
  }

  @Post(':id/enroll-free')
  @ResponseMessage('Successfully enrolled in free course')
  async enrollFreeCourse(
    @Param('id') courseId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.courseService.enrollFreeCourse(courseId, userId);
  }

  @Get(':id/lessons/progress')
  @ResponseMessage('Course lesson progress retrieved successfully')
  async getLessonProgressByCourse(
    @Param('id') courseId: string,
    @CurrentUser('sub') userId: string,
  ) {
    // Ensure course exists (and preserve consistent 404 behavior)
    await this.courseService.getCourseById(courseId);
    return this.userLessonProgressService.getProgressByUserAndCourse(
      userId,
      courseId,
    );
  }
}
