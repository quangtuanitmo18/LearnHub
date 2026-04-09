import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';

@Controller('api/v1/certificates')
@UseGuards(PermissionGuard)
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post('claim')
  claim(@CurrentUser('sub') userId: string, @Body('courseId') courseId: string) {
    return this.certificateService.claim(userId, courseId);
  }

  @Get('my-certificates')
  getMyCertificates(@CurrentUser('sub') userId: string) {
    return this.certificateService.getMyCertificates(userId);
  }

  @Public()
  @Get('verify/:id')
  verify(@Param('id') id: string) {
    return this.certificateService.verify(id);
  }
}




