'use client';

import { AnimatedCounter } from '@/components/animated-counter';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, Star, Globe, Award, Clock, TrendingUp } from 'lucide-react';

// Stats section component - Arrow function
const StatsSection = () => {
  const mainStats = [
    {
      icon: Users,
      value: '50000',
      suffix: '+',
      label: 'Active Students',
      description: 'Learning worldwide',
    },
    {
      icon: BookOpen,
      value: '1200',
      suffix: '+',
      label: 'Expert Courses',
      description: 'Across multiple domains',
    },
    {
      icon: Star,
      value: '4.9',
      suffix: '/5',
      label: 'Average Rating',
      description: 'From student reviews',
    },
    {
      icon: Globe,
      value: '150',
      suffix: '+',
      label: 'Countries',
      description: 'Students from',
    },
  ];

  const additionalStats = [
    {
      icon: Award,
      value: '95',
      suffix: '%',
      label: 'Completion Rate',
    },
    {
      icon: Clock,
      value: '10000',
      suffix: '+',
      label: 'Hours of Content',
    },
    {
      icon: TrendingUp,
      value: '98',
      suffix: '%',
      label: 'Career Growth',
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <Badge variant="secondary" className="mb-4 inline-flex items-center space-x-2">
            <TrendingUp className="h-3 w-3" />
            <span>Our Impact in Numbers</span>
          </Badge>
          <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Thousands
            </span>{' '}
            Worldwide
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
            Our commitment to quality education has created a global community of learners,
            achieving remarkable outcomes and transforming careers.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {mainStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl border border-gray-100 bg-linear-to-br from-gray-50 to-gray-100 p-8 text-center transition-all duration-300 hover:scale-105 hover:bg-linear-to-br hover:from-blue-50 hover:to-purple-50 hover:shadow-2xl"
              >
                {/* Background Gradient on Hover */}
                <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-500/0 to-purple-500/0 transition-all duration-300 group-hover:from-blue-500/5 group-hover:to-purple-500/5"></div>

                {/* Icon */}
                <div className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 shadow-lg transition-all duration-300 group-hover:shadow-xl">
                  <Icon className="h-8 w-8 text-white" />
                </div>

                {/* Stats */}
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-700 md:text-5xl">
                      <AnimatedCounter value={stat.value} duration={2500} />
                    </span>
                    <span className="ml-1 text-2xl font-bold text-blue-600 md:text-3xl">
                      {stat.suffix}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{stat.label}</h3>
                  <p className="text-gray-600">{stat.description}</p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-linear-to-br from-pink-400 to-red-500 opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100"></div>
              </div>
            );
          })}
        </div>

        {/* Additional Stats */}
        <div className="relative">
          {/* Background Design */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5"></div>

          <div className="relative z-10 rounded-3xl border border-gray-100 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {additionalStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="group flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-gray-100 to-gray-200 transition-all duration-300 group-hover:from-blue-100 group-hover:to-purple-100">
                      <Icon className="h-6 w-6 text-gray-600 transition-colors duration-300 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-gray-900 md:text-3xl">
                          <AnimatedCounter value={stat.value} duration={2000} />
                        </span>
                        <span className="ml-1 text-lg font-bold text-blue-600">{stat.suffix}</span>
                      </div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-lg text-gray-600">
            Join thousands of successful learners who have transformed their careers with us.
          </p>
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <Star className="h-5 w-5 fill-current" />
            <span className="font-medium">Rated 4.9/5 by 15,000+ students</span>
            <Star className="h-5 w-5 fill-current" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
