import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { UpdateInstructorProfileDto } from './dto/update-instructor-profile.dto';
import { SYSTEM_ROLE_NAMES } from '../../shared/configs/permission';

@Injectable()
export class InstructorService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            name: SYSTEM_ROLE_NAMES.INSTRUCTOR,
          },
        },
      },
      select: {
        id: true,
        username: true,
        // email intentionally omitted from public list
        avatar: true,
        createdAt: true,
        instructorProfile: true,
        _count: {
          select: {
            courses: {
              where: {
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
    });
  }

  async findByUsername(username: string) {
    const instructor = await this.prisma.user.findFirst({
      where: {
        username,
        roles: {
          some: {
            name: SYSTEM_ROLE_NAMES.INSTRUCTOR,
          },
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
        instructorProfile: true,
        courses: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            price: true,
            oldPrice: true,
            level: true,
            view: true,
            image: {
              select: {
                storageKey: true,
                cdnBaseUrl: true,
                filename: true,
              },
            },
            _count: {
              select: {
                lessons: true,
                reviews: true,
              },
            },
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: {
            courses: {
              where: {
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
    });

    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    return instructor;
  }

  async updateProfile(userId: string, data: UpdateInstructorProfileDto) {
    // Upsert to create profile if it doesn't exist
    return await this.prisma.instructorProfile.upsert({
      where: { userId },
      update: { ...data },
      create: { userId, ...data },
    });
  }
}
