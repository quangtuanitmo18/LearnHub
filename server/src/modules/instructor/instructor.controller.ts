import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { UpdateInstructorProfileDto } from './dto/update-instructor-profile.dto';
import { InstructorService } from './instructor.service';

@Controller('instructors')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Public()
  @Get()
  async getInstructors() {
    const instructors = await this.instructorService.findAll();
    return {
      message: 'Successfully retrieved instructors',
      data: instructors,
    };
  }

  @Public()
  @Get(':username')
  async getInstructorByUsername(@Param('username') username: string) {
    const instructor = await this.instructorService.findByUsername(username);
    return {
      message: 'Successfully retrieved instructor info',
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
      message: 'Successfully updated instructor profile',
      data: profile,
    };
  }
}
