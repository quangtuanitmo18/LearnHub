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
  StreamableFile,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { ContestService } from './contest.service';
import { QuizAttemptService } from '../quiz-attempt/quiz-attempt.service';
import {
  BulkDeleteContestDto,
  CreateContestDto,
  UpdateContestDto,
} from './dto/contest.dto';

@Controller('contests')
@UseGuards(PermissionGuard)
export class ContestController {
  constructor(
    private readonly contestService: ContestService,
    private readonly quizAttemptService: QuizAttemptService,
  ) {}

  // ─── Public Endpoints ─────────────────────────────────────────

  @Get()
  @Public()
  @ResponseMessage('Contests retrieved successfully')
  async getPublicContests() {
    return this.contestService.getPublicContests();
  }

  @Get('detail/:slug')
  @Public()
  @ResponseMessage('Contest detail retrieved successfully')
  async getContestDetail(@Param('slug') slug: string) {
    return this.contestService.getContestBySlug(slug);
  }

  @Get(':id/leaderboard')
  @Public()
  @ResponseMessage('Contest leaderboard retrieved successfully')
  async getContestLeaderboard(@Param('id') id: string) {
    return this.quizAttemptService.getLeaderboard(id, '', true);
  }

  @Post(':id/attempts/start')
  @ResponseMessage('Contest attempt started successfully')
  async startOrResumeAttempt(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.quizAttemptService.startOrResumeAttempt(id, userId, true);
  }

  @Get(':id/attempts')
  @ResponseMessage('Contest attempts retrieved successfully')
  async listAttempts(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.quizAttemptService.listAttempts(id, userId, true);
  }

  @Get('me/history')
  @ResponseMessage('Contest history retrieved successfully')
  async getMyContestHistory(@CurrentUser('sub') userId: string) {
    return this.contestService.getMyContestHistory(userId);
  }

  // ─── Admin CRUD Endpoints ─────────────────────────────────────

  @Get('admin/list')
  @RequirePermissions(PERMISSIONS.CONTEST_READ)
  @ResponseMessage('Contests retrieved successfully')
  async getAllContests(@Query() paginationQuery: PaginationQueryDto) {
    return this.contestService.getAllContests(paginationQuery);
  }

  @Get('admin/:id')
  @RequirePermissions(PERMISSIONS.CONTEST_READ)
  @ResponseMessage('Contest retrieved successfully')
  async getContestById(@Param('id') id: string) {
    return this.contestService.getContestById(id);
  }

  @Post('admin')
  @RequirePermissions(PERMISSIONS.CONTEST_CREATE)
  @ResponseMessage('Contest created successfully')
  async createContest(@Body() createContestDto: CreateContestDto) {
    return this.contestService.createContest(createContestDto);
  }

  @Put('admin/:id')
  @RequirePermissions(PERMISSIONS.CONTEST_UPDATE)
  @ResponseMessage('Contest updated successfully')
  async updateContest(
    @Param('id') id: string,
    @Body() updateContestDto: UpdateContestDto,
  ) {
    return this.contestService.updateContest(id, updateContestDto);
  }

  @Delete('admin/bulk-delete')
  @RequirePermissions(PERMISSIONS.CONTEST_DELETE)
  @ResponseMessage('Contests deleted successfully')
  async bulkDeleteContests(@Body() bulkDeleteDto: BulkDeleteContestDto) {
    return this.contestService.bulkDeleteContests(bulkDeleteDto.ids);
  }

  @Delete('admin/:id')
  @RequirePermissions(PERMISSIONS.CONTEST_DELETE)
  @ResponseMessage('Contest deleted successfully')
  async deleteContest(@Param('id') id: string) {
    return this.contestService.deleteContest(id);
  }

  // ─── Admin Attempt Management ─────────────────────────────────

  @Get('admin/:id/attempts')
  @RequirePermissions(PERMISSIONS.CONTEST_READ)
  @ResponseMessage('Contest attempts retrieved successfully')
  async getAdminContestAttempts(
    @Param('id') id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.quizAttemptService.getAdminContestAttempts(
      id,
      paginationQuery,
      true,
    );
  }

  @Get('admin/:id/export')
  @RequirePermissions(PERMISSIONS.CONTEST_READ)
  async exportContestResults(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.contestService.exportContestResults(id);
    const contest = await this.contestService.getContestById(id);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=contest-results-${contest.slug}.xlsx`,
      'Content-Length': buffer.byteLength,
    });

    return new StreamableFile(new Uint8Array(buffer));
  }

  @Delete('admin/:id/attempts/:attemptId')
  @RequirePermissions(PERMISSIONS.CONTEST_UPDATE)
  @ResponseMessage('Contest attempt deleted successfully')
  async deleteContestAttempt(
    @Param('id') id: string,
    @Param('attemptId') attemptId: string,
  ) {
    return this.quizAttemptService.deleteAttempt(attemptId);
  }

  // ─── Admin Question Management ────────────────────────────────

  @Get('admin/:id/questions')
  @RequirePermissions(PERMISSIONS.CONTEST_READ)
  @ResponseMessage('Contest questions retrieved successfully')
  async getContestQuestions(@Param('id') id: string) {
    return this.contestService.getContestQuestions(id);
  }

  @Post('admin/:id/questions')
  @RequirePermissions(PERMISSIONS.CONTEST_UPDATE)
  @ResponseMessage('Question added successfully')
  async addContestQuestion(@Param('id') id: string, @Body() question: any) {
    return this.contestService.addContestQuestion(id, question);
  }

  @Put('admin/:id/questions/:questionId')
  @RequirePermissions(PERMISSIONS.CONTEST_UPDATE)
  @ResponseMessage('Question updated successfully')
  async updateContestQuestion(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @Body() question: any,
  ) {
    return this.contestService.updateContestQuestion(id, questionId, question);
  }

  @Delete('admin/:id/questions/:questionId')
  @RequirePermissions(PERMISSIONS.CONTEST_DELETE)
  @ResponseMessage('Question deleted successfully')
  async deleteContestQuestion(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
  ) {
    return this.contestService.deleteContestQuestion(id, questionId);
  }

  @Put('admin/:id/reorder-questions')
  @RequirePermissions(PERMISSIONS.CONTEST_UPDATE)
  @ResponseMessage('Questions reordered successfully')
  async reorderContestQuestions(
    @Param('id') id: string,
    @Body() body: { questionIds: string[] },
  ) {
    return this.contestService.reorderContestQuestions(id, body.questionIds);
  }
}
