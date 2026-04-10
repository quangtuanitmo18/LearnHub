import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NoteService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createNoteDto: CreateNoteDto) {
    return this.prisma.videoNote.create({
      data: {
        userId,
        lessonId: createNoteDto.lessonId,
        content: createNoteDto.content,
        timestamp: createNoteDto.timestamp,
      },
    });
  }

  async findAllByLesson(userId: string, lessonId: string) {
    return this.prisma.videoNote.findMany({
      where: { userId, lessonId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async update(userId: string, id: string, updateNoteDto: UpdateNoteDto) {
    const note = await this.prisma.videoNote.findUnique({ where: { id } });
    if (!note || note.userId !== userId) {
      throw new NotFoundException('Note not found');
    }
    return this.prisma.videoNote.update({
      where: { id },
      data: {
        content:
          updateNoteDto.content !== undefined
            ? updateNoteDto.content
            : note.content,
        timestamp:
          updateNoteDto.timestamp !== undefined
            ? updateNoteDto.timestamp
            : note.timestamp,
      },
    });
  }

  async remove(userId: string, id: string) {
    const note = await this.prisma.videoNote.findUnique({ where: { id } });
    if (!note || note.userId !== userId) {
      throw new NotFoundException('Note not found');
    }
    return this.prisma.videoNote.delete({
      where: { id },
    });
  }
}
