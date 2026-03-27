import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * GET /stats/dashboard
   * Returns: totalUsers, activeCourses, userRoles, totalRevenue
   * Each with count, changeFromLastMonth, changePercentage
   */
  async getDashboardStats() {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // ── Total Users ──
    const [totalUsersCount, usersLastMonth] = await Promise.all([
      this.prismaService.user.count(),
      this.prismaService.user.count({
        where: { createdAt: { lt: startOfCurrentMonth } },
      }),
    ]);
    const usersChange = totalUsersCount - usersLastMonth;
    const usersPercentage =
      usersLastMonth > 0 ? Math.round((usersChange / usersLastMonth) * 100) : 0;

    // ── Active Courses (PUBLISHED) ──
    const [activeCoursesCount, coursesLastMonth] = await Promise.all([
      this.prismaService.course.count({
        where: { status: 'PUBLISHED' },
      }),
      this.prismaService.course.count({
        where: {
          status: 'PUBLISHED',
          createdAt: { lt: startOfCurrentMonth },
        },
      }),
    ]);
    const coursesChange = activeCoursesCount - coursesLastMonth;
    const coursesPercentage =
      coursesLastMonth > 0
        ? Math.round((coursesChange / coursesLastMonth) * 100)
        : 0;

    // ── User Roles ──
    const [rolesCount, rolesLastMonth] = await Promise.all([
      this.prismaService.role.count(),
      this.prismaService.role.count({
        where: { createdAt: { lt: startOfCurrentMonth } },
      }),
    ]);
    const rolesChange = rolesCount - rolesLastMonth;
    const rolesPercentage =
      rolesLastMonth > 0 ? Math.round((rolesChange / rolesLastMonth) * 100) : 0;

    // ── Total Revenue (completed orders) ──
    const [revenueAll, revenueLastMonth] = await Promise.all([
      this.prismaService.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'COMPLETED' },
      }),
      this.prismaService.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: 'COMPLETED',
          createdAt: { lt: startOfCurrentMonth },
        },
      }),
    ]);

    const totalRevenue = Number(revenueAll._sum.totalAmount ?? 0);
    const lastMonthRevenue = Number(revenueLastMonth._sum.totalAmount ?? 0);
    const revenueChange = totalRevenue - lastMonthRevenue;
    const revenuePercentage =
      lastMonthRevenue > 0
        ? Math.round((revenueChange / lastMonthRevenue) * 100)
        : 0;

    return {
      totalUsers: {
        count: totalUsersCount,
        changeFromLastMonth: usersChange,
        changePercentage: usersPercentage,
      },
      activeCourses: {
        count: activeCoursesCount,
        changeFromLastMonth: coursesChange,
        changePercentage: coursesPercentage,
      },
      userRoles: {
        count: rolesCount,
        changeFromLastMonth: rolesChange,
        changePercentage: rolesPercentage,
      },
      totalRevenue: {
        count: totalRevenue,
        changeFromLastMonth: revenueChange,
        changePercentage: revenuePercentage,
      },
    };
  }

  /**
   * GET /stats/overview
   * Returns monthly revenue & sales count for the current year
   */
  async getOverviewStats() {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    const completedOrders = await this.prismaService.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startOfYear, lt: endOfYear },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Build a map month → { totalRevenue, salesCount }
    const monthlyMap = new Map<
      number,
      { totalRevenue: number; salesCount: number }
    >();

    for (let i = 0; i < 12; i++) {
      monthlyMap.set(i, { totalRevenue: 0, salesCount: 0 });
    }

    for (const order of completedOrders) {
      const month = order.createdAt.getMonth();
      const entry = monthlyMap.get(month)!;
      entry.totalRevenue += Number(order.totalAmount);
      entry.salesCount += 1;
    }

    return monthNames.map((monthName, index) => ({
      year: currentYear,
      month: index + 1,
      monthName,
      totalRevenue: monthlyMap.get(index)!.totalRevenue,
      salesCount: monthlyMap.get(index)!.salesCount,
    }));
  }

  /**
   * GET /stats/recent-sales
   * Returns the 10 most recent completed orders with customer info
   */
  async getRecentSales() {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [recentOrders, currentMonthOrders] = await Promise.all([
      this.prismaService.order.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              username: true,
              email: true,
              avatar: true,
            },
          },
          items: true,
        },
      }),
      this.prismaService.order.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startOfCurrentMonth },
        },
        _count: true,
        _sum: { totalAmount: true },
      }),
    ]);

    const recentSales = recentOrders.map((order) => ({
      id: order.id,
      orderCode: order.code,
      customer: {
        name: order.user?.username || 'Unknown',
        email: order.user?.email || '',
        avatar: order.user?.avatar || '',
      },
      amount: Number(order.totalAmount),
      itemCount: order.items.length,
      date: order.createdAt.toISOString(),
    }));

    return {
      success: true,
      message: 'Recent sales retrieved successfully',
      statusCode: 200,
      recentSales,
      currentMonthSummary: {
        salesCount: currentMonthOrders._count,
        totalRevenue: Number(currentMonthOrders._sum.totalAmount ?? 0),
      },
    };
  }
}
