'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllCategories } from '@/hooks/use-categories';
import type { ICategory } from '@/types/category';
import { Star, TrendingUp, RotateCcw, Folder } from 'lucide-react';
import { CourseLevel } from '@/types/course';
import { formatPrice } from '@/utils/format';

// Extended category interface with course count
interface ICategoryWithCount extends ICategory {
  courseCount?: number;
}

interface CoursesFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: number[];
  onPriceRangeChange: (range: number[]) => void;
  selectedLevels: string[];
  onLevelsChange: (levels: string[]) => void;
  selectedRating: number;
  onRatingChange: (rating: number) => void;
}
const levels = Object.entries(CourseLevel).map(([key, value]) => ({
  id: value,
  label: key,
}));
console.log('levels', levels);
// const levels = [
//   { id: "beginner", name: "Beginner", count: 623 },
//   { id: "intermediate", name: "Intermediate", count: 412 },
//   { id: "advanced", name: "Advanced", count: 212 },
// ];

const priceRanges = [
  { id: 'free', label: 'Free', range: [0, 0] },
  { id: 'under-50', label: 'Under $50', range: [0, 50] },
  { id: '50-100', label: '$50-$100', range: [50, 100] },
  { id: '100-200', label: '$100-$200', range: [100, 200] },
  { id: '200-300', label: '$200-$300', range: [200, 300] },
  { id: '300-plus', label: '$300+', range: [300, 500] },
];

const CoursesFilters = ({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  selectedLevels,
  onLevelsChange,
  selectedRating,
  onRatingChange,
}: CoursesFiltersProps) => {
  // Fetch categories from API
  const { data: categoriesData, isLoading: categoriesLoading } = useAllCategories();

  // Transform categories data to match component structure
  const categories = React.useMemo(() => {
    if (!categoriesData) return [];

    // Cast categories data to include courseCount
    const categoriesWithCount = categoriesData as ICategoryWithCount[];

    // Calculate total courses across all categories
    const totalCourses = categoriesWithCount.reduce((sum, cat) => sum + (cat.courseCount || 0), 0);

    // Add "All Categories" option at the beginning
    const allCategoriesOption = {
      id: 'all',
      name: 'All Categories',
      icon: TrendingUp,
      count: totalCourses,
    };

    // Transform API categories to component format
    const transformedCategories = categoriesWithCount.map((category) => ({
      id: category.id,
      name: category.name,
      icon: Folder,
      count: category.courseCount || 0,
    }));

    return [allCategoriesOption, ...transformedCategories];
  }, [categoriesData]);

  const handleLevelToggle = (levelId: string) => {
    onLevelsChange(
      selectedLevels.includes(levelId)
        ? selectedLevels.filter((id) => id !== levelId)
        : [...selectedLevels, levelId],
    );
  };

  const clearAllFilters = () => {
    onCategoryChange('all');
    onPriceRangeChange([0, 500]);
    onLevelsChange([]);
    onRatingChange(0);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="h-8 text-xs text-blue-600 hover:text-blue-700 sm:h-9 sm:text-sm"
        >
          <RotateCcw className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
          Clear All
        </Button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-900 sm:mb-3 sm:text-base">Categories</h4>
        <div className="space-y-1.5 sm:space-y-2">
          {categoriesLoading
            ? // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-2 sm:p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Skeleton className="h-3 w-3 rounded sm:h-4 sm:w-4" />
                      <Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
                    </div>
                    <Skeleton className="h-4 w-6 rounded-full sm:h-5 sm:w-8" />
                  </div>
                </div>
              ))
            : categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`flex w-full items-center justify-between rounded-lg border p-2 capitalize transition-all duration-200 sm:p-3 ${
                      selectedCategory === category.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex min-w-0 items-center space-x-2 sm:space-x-3">
                      <IconComponent className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
                      <span className="truncate text-xs font-medium sm:text-sm">
                        {category.name}
                      </span>
                    </div>
                    <Badge
                      variant={selectedCategory === category.id ? 'default' : 'secondary'}
                      className="shrink-0 text-[10px] sm:text-xs"
                    >
                      {category.count}
                    </Badge>
                  </button>
                );
              })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-900 sm:mb-3 sm:text-base">Price Range</h4>
        <div className="space-y-3 sm:space-y-4">
          <div className="px-2 sm:px-3">
            <Slider
              value={priceRange}
              onValueChange={onPriceRangeChange}
              max={500}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-600 sm:mt-2 sm:text-xs">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}+</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {priceRanges.map((pricePreset) => (
              <Button
                key={pricePreset.id}
                variant="outline"
                size="sm"
                onClick={() => onPriceRangeChange(pricePreset.range)}
                className="h-8 flex-1 px-2 text-[10px] sm:h-9 sm:text-xs"
              >
                {pricePreset.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Level */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-900 sm:mb-3 sm:text-base">Level</h4>
        <div className="space-y-2 sm:space-y-3">
          {levels.map((level) => (
            <div key={level.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Checkbox
                  id={level.id}
                  checked={selectedLevels.includes(level.id)}
                  onCheckedChange={() => handleLevelToggle(level.id)}
                  className="h-4 w-4 sm:h-5 sm:w-5"
                />
                <label
                  htmlFor={level.id}
                  className="cursor-pointer text-xs font-medium text-gray-700 lowercase first-letter:uppercase sm:text-sm"
                >
                  {level.label}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-900 sm:mb-3 sm:text-base">Rating</h4>
        <div className="space-y-1.5 sm:space-y-2">
          {[4.5, 4.0, 3.5, 3.0].map((rating) => (
            <button
              key={rating}
              onClick={() => onRatingChange(rating)}
              className={`flex w-full items-center justify-between rounded-lg border p-2 transition-all duration-200 ${
                selectedRating === rating
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                        i < Math.floor(rating) ? 'fill-current text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium sm:text-sm">{rating} & up</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesFilters;
