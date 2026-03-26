import { Controller, UseGuards } from '@nestjs/common';
import { PermissionGuard } from 'src/shared/guards/permission.guard';

@Controller()
@UseGuards(PermissionGuard)
export class UserLessonProgressController {}
