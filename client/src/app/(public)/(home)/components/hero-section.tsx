'use client';

import { AnimatedCounter } from '@/components/animated-counter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTE_CONFIG } from '@/configs/routes';
import { ArrowRight, BookOpen, CheckCircle, Star, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
// Hero section component - Arrow function
const HeroSection = () => {
  const stats = [
    { icon: Users, label: 'Students', value: '50,000+' },
    { icon: BookOpen, label: 'Courses', value: '1,200+' },
    { icon: Star, label: 'Rating', value: '4.9/5' },
  ];

  const features = [
    'Expert-led courses',
    'Lifetime access',
    'Certificate of completion',
    'Mobile & desktop learning',
  ];

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="bg-grid-slate-100 absolute inset-0 -z-10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:py-20">
        <div className="grid items-center gap-8 sm:gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <div className="space-y-6 text-center sm:space-y-8 lg:text-left">
            {/* Badge */}
            <Badge
              variant="secondary"
              className="mx-auto inline-flex items-center space-x-1 text-xs sm:text-sm lg:mx-0"
            >
              <Star className="h-3 w-3 fill-current sm:h-4 sm:w-4" />
              <span>Rated #1 Online Learning Platform</span>
            </Badge>

            {/* Main Heading */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl leading-tight font-bold sm:text-4xl md:text-5xl xl:text-7xl">
                Learn Skills That{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Matter
                </span>
              </h1>
              <p className="mx-auto max-w-lg text-base leading-relaxed text-gray-600 sm:text-lg md:text-xl lg:mx-0">
                Transform your career with industry-relevant courses taught by world-class
                instructors. Start learning today and unlock your potential.
              </p>
            </div>

            {/* Features List */}
            <div className="mx-auto grid max-w-md grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:mx-0">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center space-x-2 lg:justify-start"
                >
                  <CheckCircle className="h-4 w-4 shrink-0 text-green-500 sm:h-5 sm:w-5" />
                  <span className="text-sm text-gray-600 sm:text-base">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mx-auto flex w-full max-w-xs flex-col gap-3 sm:flex-row sm:gap-4 lg:mx-0">
              {/* Primary CTA - Start Learning */}
              <Button
                size="lg"
                className="group relative h-12 w-full overflow-hidden rounded-xl border-0 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 px-6 text-sm font-semibold text-white shadow-xl transition-all duration-300 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 hover:shadow-2xl sm:h-14 sm:w-auto sm:flex-none sm:px-8 sm:text-base"
                asChild
              >
                <Link href={ROUTE_CONFIG.COURSES}>
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 transform bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"></div>
                  <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                    Start Learning
                  </span>
                  <ArrowRight className="relative z-10 ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 justify-center gap-4 pt-2 sm:flex sm:flex-wrap sm:gap-6 sm:pt-4 lg:justify-start lg:gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex min-w-0 items-center space-x-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10">
                      <Icon className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">
                        <AnimatedCounter value={stat.value} duration={2000} />
                      </div>
                      <div className="truncate text-xs text-gray-600 sm:text-sm">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Content - Hero Illustration */}
          <div className="relative order-first mx-auto h-[300px] w-full sm:h-[400px] md:h-[450px] lg:order-last lg:mx-0 lg:h-[500px] xl:h-[600px]">
            {/* Beautiful Animated Stars */}

            {/* Hero Image */}
            <Image
              src="/images/hero3.png"
              alt="Learning Student"
              fill
              fetchPriority="high"
              priority={true}
              quality={85}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 550px"
              className="relative z-10 object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
