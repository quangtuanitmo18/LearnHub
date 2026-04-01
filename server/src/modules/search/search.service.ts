import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prismaService: PrismaService) {}

  async search(query: string, limit: number = 5) {
    if (!query || query.trim().length < 2) {
      return { courses: [], blogs: [] };
    }

    const searchTerm = query.trim();

    const [courses, blogs] = await Promise.all([
      this.prismaService.course.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            {
              description: { contains: searchTerm, mode: 'insensitive' },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          image: true,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.blog.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            {
              content: { contains: searchTerm, mode: 'insensitive' },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { courses, blogs };
  }
}
