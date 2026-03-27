'use client';

import { BookOpen, Users, Star, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from '@/components/animated-counter';

const CoursesHeader = () => {
  return (
    <div className="relative overflow-hidden bg-linear-to-br from-indigo-900 via-blue-800 to-purple-800">
      {/* Background patterns and decorative elements */}
      <div className="absolute inset-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/30" />

        {/* Animated background shapes */}
        <div className="absolute top-10 left-10 h-64 w-64 animate-pulse rounded-full bg-white/5 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-96 w-96 animate-pulse rounded-full bg-blue-400/10 blur-3xl delay-1000" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid h-full scale-150 rotate-12 transform grid-cols-12 gap-4">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="rounded-sm bg-white/20" />
            ))}
          </div>
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:py-20 xl:py-24">
        {/* Main content */}
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm sm:mb-6 sm:px-4 sm:py-2">
            <BookOpen className="h-3 w-3 text-blue-200 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium text-blue-100 sm:text-sm">Learning Platform</span>
          </div>

          {/* Main heading */}
          <h1 className="mb-4 text-3xl leading-tight font-bold text-white sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Discover Amazing
            <span className="block bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              Courses
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-6 max-w-3xl px-4 text-base leading-relaxed text-blue-100 sm:mb-8 sm:text-lg md:text-xl lg:text-2xl">
            Master new skills with thousands of expert-led courses designed to help you grow
            professionally and personally
          </p>

          {/* Stats */}
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            <div className="group text-center">
              <div className="mb-1.5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/20 sm:mb-2 sm:h-12 sm:w-12 sm:rounded-xl">
                <BookOpen className="h-5 w-5 text-blue-200 sm:h-6 sm:w-6" />
              </div>
              <div className="text-lg font-bold text-white sm:text-xl lg:text-2xl">
                <AnimatedCounter value="500+" duration={2000} />
              </div>
              <div className="text-xs text-blue-200 sm:text-sm">Courses</div>
            </div>

            <div className="group text-center">
              <div className="mb-1.5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/20 sm:mb-2 sm:h-12 sm:w-12 sm:rounded-xl">
                <Users className="h-5 w-5 text-blue-200 sm:h-6 sm:w-6" />
              </div>
              <div className="text-lg font-bold text-white sm:text-xl lg:text-2xl">
                <AnimatedCounter value="50K+" duration={2200} />
              </div>
              <div className="text-xs text-blue-200 sm:text-sm">Students</div>
            </div>

            <div className="group text-center">
              <div className="mb-1.5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/20 sm:mb-2 sm:h-12 sm:w-12 sm:rounded-xl">
                <Star className="h-5 w-5 text-blue-200 sm:h-6 sm:w-6" />
              </div>
              <div className="text-lg font-bold text-white sm:text-xl lg:text-2xl">
                <AnimatedCounter value="4.8" duration={1800} />
              </div>
              <div className="text-xs text-blue-200 sm:text-sm">Rating</div>
            </div>

            <div className="group text-center">
              <div className="mb-1.5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/20 sm:mb-2 sm:h-12 sm:w-12 sm:rounded-xl">
                <TrendingUp className="h-5 w-5 text-blue-200 sm:h-6 sm:w-6" />
              </div>
              <div className="text-lg font-bold text-white sm:text-xl lg:text-2xl">
                <AnimatedCounter value="95%" duration={2400} />
              </div>
              <div className="text-xs text-blue-200 sm:text-sm">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern wave design */}
      <div className="absolute right-0 bottom-0 left-0">
        <svg viewBox="0 0 1440 120" className="h-auto w-full">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(249, 250, 251)" />
              <stop offset="100%" stopColor="rgb(248, 250, 252)" />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGradient)"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,85.3C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>
    </div>
  );
};

export default CoursesHeader;
