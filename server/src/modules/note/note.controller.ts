import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteService } from './note.service';

@Controller('notes')
@UseGuards(PermissionGuard)
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() createNoteDto: CreateNoteDto,
  ) {
    return this.noteService.create(userId, createNoteDto);
  }

  @Get('lesson/:lessonId')
  findAllByLesson(
    @CurrentUser('sub') userId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.noteService.findAllByLesson(userId, lessonId);
  }

  @Patch(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    return this.noteService.update(userId, id, updateNoteDto);
  }

  @Delete(':id')
  remove(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.noteService.remove(userId, id);
  }
}
