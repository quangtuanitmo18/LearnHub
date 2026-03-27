'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Heart, Sparkles, Star, Target, Users } from 'lucide-react';
import Link from 'next/link';

// Hero section component - Arrow function
const HeroSection = () => {
  const highlights = [
    'Founded in 2020',
    '50,000+ Students worldwide',
    'Award-winning platform',
    'Expert instructors',
  ];

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="bg-grid-slate-100 absolute inset-0 -z-10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

      <div className="container mx-auto px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <Badge variant="secondary" className="inline-flex items-center space-x-2">
              <Heart className="h-3 w-3 fill-current text-red-500" />
              <span>Passionate About Learning</span>
            </Badge>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                We&apos;re Building the{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Future
                </span>{' '}
                of Education
              </h1>
              <p className="max-w-lg text-xl leading-relaxed text-gray-600">
                At LearnHub, we believe that quality education should be accessible to everyone,
                everywhere. Our mission is to democratize learning and empower individuals to
                achieve their goals through world-class online education.
              </p>
            </div>

            {/* Highlights List */}
            <div className="grid grid-cols-2 gap-3">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                  <span className="text-sm text-gray-600">{highlight}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="px-8 text-base" asChild>
                <Link href="/courses">
                  Explore Our Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 text-base" asChild>
                <Link href="/contact">
                  <Users className="mr-2 h-4 w-4" />
                  Join Our Community
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Abstract Illustration */}
          <div className="relative mx-auto h-[500px] w-full md:h-[600px]">
            {/* Decorative Elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {/* Floating Icons */}
              <div className="animate-float-slow absolute top-4 left-4">
                <div className="flex h-16 w-16 rotate-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="animate-float-medium absolute top-20 right-8">
                <div className="flex h-12 w-12 -rotate-12 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="animate-float-fast absolute bottom-20 left-8">
                <div className="flex h-14 w-14 rotate-45 items-center justify-center rounded-2xl bg-linear-to-br from-green-500 to-green-600 shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>

              {/* Gradient Orbs */}
              <div className="absolute top-32 right-4 h-32 w-32 animate-pulse rounded-full bg-linear-to-br from-blue-400/20 to-purple-500/20 blur-2xl"></div>
              <div className="absolute bottom-32 left-4 h-40 w-40 animate-pulse rounded-full bg-linear-to-br from-purple-400/20 to-pink-500/20 blur-3xl delay-1000"></div>

              {/* Animated Stars */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`animate-twinkle-slow absolute`}
                  style={{
                    top: `${Math.random() * 80 + 10}%`,
                    left: `${Math.random() * 80 + 10}%`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                >
                  <Star className={`h-4 w-4 fill-current text-yellow-400 opacity-70`} />
                </div>
              ))}
            </div>

            {/* Central Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative z-10">
                <div className="flex h-48 w-48 animate-pulse items-center justify-center rounded-full bg-linear-to-br from-blue-600 via-purple-600 to-blue-800 shadow-2xl md:h-64 md:w-64">
                  <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm md:h-52 md:w-52">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/20 md:h-44 md:w-44">
                      <Heart className="h-16 w-16 text-white md:h-20 md:w-20" />
                    </div>
                  </div>
                </div>

                {/* Orbiting Elements */}
                <div className="absolute inset-0 animate-spin">
                  <div className="absolute -top-4 left-1/2 h-8 w-8 -translate-x-1/2 transform rounded-full bg-yellow-400 shadow-lg"></div>
                  <div className="absolute top-1/2 -right-4 h-6 w-6 -translate-y-1/2 transform rounded-full bg-green-400 shadow-lg"></div>
                  <div className="absolute -bottom-4 left-1/2 h-10 w-10 -translate-x-1/2 transform rounded-full bg-pink-400 shadow-lg"></div>
                  <div className="absolute top-1/2 -left-4 h-7 w-7 -translate-y-1/2 transform rounded-full bg-blue-400 shadow-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
