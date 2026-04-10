import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../shared/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CertificatePdfService } from './certificate-pdf.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly pdfService: CertificatePdfService,
    @InjectQueue('gamification') private readonly gamificationQueue: Queue,
  ) {}

  async claim(userId: string, courseId: string) {
    // 1. Duplicate guard
    const existing = await this.prisma.certificate.findUnique({
      where: { unique_user_certificate: { userId, courseId } },
    });
    if (existing) {
      throw new ConflictException(
        'You have already claimed the certificate for this course',
      );
    }

    // 2. Must have published lessons
    const totalLessons = await this.prisma.lesson.count({
      where: { courseId, published: true },
    });
    if (totalLessons === 0) {
      throw new BadRequestException('This course has no published lessons');
    }

    // 3. Learner must have completed every lesson
    const completedLessons = await this.prisma.userLessonProgress.count({
      where: { userId, courseId },
    });
    if (completedLessons < totalLessons) {
      throw new BadRequestException(
        `You have not completed all lessons (${completedLessons}/${totalLessons})`,
      );
    }

    // 4. Fetch user + course info (needed for PDF)
    const [user, course] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, email: true },
      }),
      this.prisma.course.findUnique({
        where: { id: courseId },
        select: {
          title: true,
          slug: true,
          image: { select: { cdnBaseUrl: true, storageKey: true } },
          author: { select: { username: true } },
        },
      }),
    ]);

    // 5. Create the certificate record (pdfUrl filled in asynchronously)
    const cert = await this.prisma.certificate.create({
      data: { userId, courseId, pdfUrl: null },
      include: {
        user: { select: { username: true, email: true } },
        course: {
          select: {
            title: true,
            slug: true,
            image: { select: { cdnBaseUrl: true, storageKey: true } },
            author: { select: { username: true } },
          },
        },
      },
    });

    // 6. Generate + upload PDF in background (do NOT await — respond fast)
    void this.generatePdfBackground(cert.id, {
      username: user?.username || 'Learner',
      courseTitle: course?.title || '',
      instructorName: course?.author?.username || '',
      issuedAt: cert.issuedAt,
      courseThumbnailUrl: course?.image
        ? `${course.image.cdnBaseUrl}/${course.image.storageKey}`
        : undefined,
    });

    // 7. Gamification: +50 points for completing a course
    void this.gamificationQueue.add('add-points', {
      userId,
      points: 50,
      reason: 'COURSE_COMPLETED',
      metadata: { courseId, certificateId: cert.id },
    });

    return cert;
  }

  async getMyCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
            image: { select: { cdnBaseUrl: true, storageKey: true } },
            author: { select: { username: true } },
          },
        },
      },
    });
  }

  async verify(id: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, email: true } },
        course: {
          select: {
            title: true,
            slug: true,
            image: { select: { cdnBaseUrl: true, storageKey: true } },
            author: { select: { username: true } },
          },
        },
      },
    });

    if (!cert) {
      throw new NotFoundException('Certificate not found');
    }

    return cert;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Runs in background — generate PDF, upload to S3, update DB record */
  private async generatePdfBackground(
    certificateId: string,
    info: {
      username: string;
      courseTitle: string;
      instructorName: string;
      issuedAt: Date;
      courseThumbnailUrl?: string;
    },
  ) {
    try {
      const frontendUrl =
        this.configService.get<string>('frontendUrl') ||
        'http://localhost:4000';

      const pdfUrl = await this.pdfService.generateAndUpload({
        certificateId,
        recipientName: info.username,
        courseTitle: info.courseTitle,
        instructorName: info.instructorName,
        issuedDate: new Intl.DateTimeFormat('en-US', {
          month: 'long',
          day: '2-digit',
          year: 'numeric',
        }).format(new Date(info.issuedAt)),
        courseThumbnailUrl: info.courseThumbnailUrl,
        verifyUrl: `${frontendUrl}/certificate/${certificateId}`,
      });

      await this.prisma.certificate.update({
        where: { id: certificateId },
        data: { pdfUrl },
      });

      this.logger.log(`Certificate PDF ready: ${certificateId} → ${pdfUrl}`);
    } catch (err) {
      this.logger.error(
        `Failed to generate PDF for certificate ${certificateId}: ${(err as Error).message}`,
        (err as Error).stack,
      );
    }
  }
}
