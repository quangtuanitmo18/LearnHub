import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { Public } from '../../shared/decorators/public.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { UpdateInstructorProfileDto } from './dto/update-instructor-profile.dto';

@Controller('instructors')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Public()
  @Get()
  async getInstructors() {
    const instructors = await this.instructorService.findAll();
    return {
      message: 'Lấy danh sách giảng viên thành công',
      data: instructors,
    };
  }

  @Public()
  @Get(':username')
  async getInstructorByUsername(@Param('username') username: string) {
    const instructor = await this.instructorService.findByUsername(username);
    return {
      message: 'Lấy thông tin giảng viên thành công',
      data: instructor,
    };
  }

  // Authenticated users can update their own instructor profile
  @Post('profile/me')
  async updateMyProfile(
    @CurrentUser() user: { sub: string },
    @Body() data: UpdateInstructorProfileDto,
  ) {
    const profile = await this.instructorService.updateProfile(user.sub, data);
    return {
      message: 'Cập nhật hồ sơ giảng viên thành công',
      data: profile,
    };
  }
}
