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
    const fuzzSearchTerm = `%${searchTerm}%`;

    // 1. Tìm Course ID bằng Query thô kèm f_unaccent để gỡ dấu Tiếng Việt và lấy điểm similarity
    const courseHits = await this.prismaService.$queryRaw<{ id: string }[]>`
      SELECT id, similarity(f_unaccent(title), f_unaccent(${searchTerm})) as sim
      FROM "Course"
      WHERE status = 'PUBLISHED'
      AND (
        f_unaccent(title) ILIKE f_unaccent(${fuzzSearchTerm})
        OR f_unaccent(description) ILIKE f_unaccent(${fuzzSearchTerm})
      )
      ORDER BY sim DESC, "createdAt" DESC
      LIMIT ${limit}
    `;

    // 2. Tìm Blog ID tương tự
    const blogHits = await this.prismaService.$queryRaw<{ id: string }[]>`
      SELECT id, similarity(f_unaccent(title), f_unaccent(${searchTerm})) as sim
      FROM "Blog"
      WHERE status = 'PUBLISHED'
      AND (
        f_unaccent(title) ILIKE f_unaccent(${fuzzSearchTerm})
        OR f_unaccent(content) ILIKE f_unaccent(${fuzzSearchTerm})
      )
      ORDER BY sim DESC, "createdAt" DESC
      LIMIT ${limit}
    `;

    // 3. Truy vấn dữ liệu đầy đủ bằng ID đã lấy được và giữ nguyên thứ tự (Rank)
    const [courses, blogs] = await Promise.all([
      courseHits.length > 0
        ? this.prismaService.course
            .findMany({
              where: { id: { in: courseHits.map((h) => h.id) } },
              select: {
                id: true,
                title: true,
                slug: true,
                image: true,
              },
            })
            .then((res) => {
              const idToData = new Map(res.map((c) => [c.id, c]));
              return courseHits.map((h) => idToData.get(h.id)).filter(Boolean);
            })
        : Promise.resolve([]),

      blogHits.length > 0
        ? this.prismaService.blog
            .findMany({
              where: { id: { in: blogHits.map((h) => h.id) } },
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
              },
            })
            .then((res) => {
              const idToData = new Map(res.map((b) => [b.id, b]));
              return blogHits.map((h) => idToData.get(h.id)).filter(Boolean);
            })
        : Promise.resolve([]),
    ]);

    return { courses, blogs };
  }
}
