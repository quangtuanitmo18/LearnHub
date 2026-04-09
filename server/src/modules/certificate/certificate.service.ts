import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';

@Injectable()
export class CertificateService {
  constructor(private prisma: PrismaService) {}

  async claim(userId: string, courseId: string) {
    // 1. Check if already claimed
    const existing = await this.prisma.certificate.findUnique({
      where: { unique_user_certificate: { userId, courseId } },
    });
    if (existing) {
      throw new ConflictException('You have already claimed the certificate for this course');
    }

    // 2. Count total published lessons in course
    const totalLessons = await this.prisma.lesson.count({
      where: { courseId, published: true },
    });

    if (totalLessons === 0) {
      throw new BadRequestException('This course has no published lessons');
    }

    // 3. Count completed lessons by user
    const completedLessons = await this.prisma.userLessonProgress.count({
      where: { userId, courseId },
    });

    if (completedLessons < totalLessons) {
      throw new BadRequestException(`You have not completed all lessons (${completedLessons}/${totalLessons})`);
    }

    // 4. Create certificate
    return this.prisma.certificate.create({
      data: {
        userId,
        courseId,
        pdfUrl: '', // To be generated on the client or by a background worker
      },
      include: {
        course: { select: { title: true, slug: true, image: true, author: { select: { username: true } } } },
      },
    });
  }

  async getMyCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      include: {
        course: { select: { title: true, slug: true, image: true, author: { select: { username: true } } } },
      },
    });
  }

  async verify(id: string) {
    return this.prisma.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, email: true } },
        course: { select: { title: true } },
      },
    });
  }
}
