import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { QuizQuestionService } from './quiz-question.service';

@Controller('quiz-questions')
@UseGuards(PermissionGuard)
export class QuizQuestionController {
  constructor(
    private readonly quizQuestionService: QuizQuestionService,
  ) {}

  @Get('lesson/:lessonId')
  @RequirePermissions(PERMISSIONS.COURSE_READ)
  @ResponseMessage('Quiz retrieved successfully')
  getQuizByLesson(@Param('lessonId') lessonId: string) {
    return this.quizQuestionService.getQuizByLesson(lessonId);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.COURSE_READ)
  @ResponseMessage('Quiz retrieved successfully')
  getQuiz(@Param('id') id: string) {
    return this.quizQuestionService.getQuizById(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Quiz created successfully')
  createQuiz(@Body() body: { questions: any[] }) {
    return this.quizQuestionService.createQuiz(body.questions);
  }

  @Put(':id/questions')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Quiz questions updated successfully')
  updateQuizQuestions(
    @Param('id') id: string,
    @Body() body: { questions: any[] },
  ) {
    return this.quizQuestionService.updateQuizQuestions(id, body.questions);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.COURSE_DELETE)
  @ResponseMessage('Quiz deleted successfully')
  deleteQuiz(@Param('id') id: string) {
    return this.quizQuestionService.deleteQuiz(id);
  }

  @Put(':id/publish')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Quiz published successfully')
  publishQuiz(@Param('id') id: string) {
    return this.quizQuestionService.setPublishStatus(id, true);
  }

  @Put(':id/unpublish')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Quiz unpublished successfully')
  unpublishQuiz(@Param('id') id: string) {
    return this.quizQuestionService.setPublishStatus(id, false);
  }

  @Post(':quizId/questions')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Question added successfully')
  addQuestion(
    @Param('quizId') quizId: string,
    @Body() question: any,
  ) {
    return this.quizQuestionService.addQuestion(quizId, question);
  }

  @Put(':quizId/questions/:questionId')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Question updated successfully')
  updateQuestion(
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
    @Body() question: any,
  ) {
    return this.quizQuestionService.updateQuestion(
      quizId,
      questionId,
      question,
    );
  }

  @Delete(':quizId/questions/:questionId')
  @RequirePermissions(PERMISSIONS.COURSE_DELETE)
  @ResponseMessage('Question deleted successfully')
  deleteQuestion(
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.quizQuestionService.deleteQuestion(quizId, questionId);
  }

  @Put(':quizId/reorder-questions')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Questions reordered successfully')
  reorderQuestions(
    @Param('quizId') quizId: string,
    @Body() body: { questionIds: string[] },
  ) {
    return this.quizQuestionService.reorderQuestions(
      quizId,
      body.questionIds,
    );
  }
}
