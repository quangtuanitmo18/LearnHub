'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MdCheckCircle, MdPlayCircleOutline, MdSchool } from 'react-icons/md';

interface ProfileStatsCardsProps {
  totalCourses: number;
  studyingCourses: number;
  completedCourses: number;
}

// Profile stats cards component - Arrow function
const ProfileStatsCards = ({
  totalCourses,
  studyingCourses,
  completedCourses,
}: ProfileStatsCardsProps) => {
  const stats = [
    {
      title: 'Your Courses',
      value: totalCourses,
      icon: MdSchool,
    },
    {
      title: 'In Progress',
      value: studyingCourses,
      icon: MdPlayCircleOutline,
    },
    {
      title: 'Completed',
      value: completedCourses,
      icon: MdCheckCircle,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-4 md:gap-6 lg:mb-10">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        // Define colors for each card based on the image
        const iconColors = [
          'bg-red-500', // Your courses - red
          'bg-orange-500', // In progress - orange
          'bg-green-500', // Completed - green
        ];

        return (
          <Card key={index} className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="space-y-2 text-center sm:space-y-3 md:space-y-4">
                {/* Icon */}
                <div
                  className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 ${iconColors[index]} mx-auto flex items-center justify-center rounded-full`}
                >
                  <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6 md:h-7 md:w-7" />
                </div>

                {/* Value */}
                <div className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl dark:text-white">
                  {stat.value}
                </div>

                {/* Title */}
                <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                  {stat.title}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProfileStatsCards;
