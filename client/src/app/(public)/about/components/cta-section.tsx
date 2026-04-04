'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Users, Star, Sparkles, Heart, CheckCircle } from 'lucide-react';
import Link from 'next/link';

// Call to action section component - Arrow function
const CallToActionSection = () => {
  const benefits = [
    'Access to 1,200+ premium courses',
    'Learn from industry experts',
    'Flexible learning schedules',
    'Certificate of completion',
    'Lifetime access to content',
    '24/7 community support',
  ];

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-blue-600 via-blue-700 to-purple-700 py-20">
      {/* Background Pattern */}
      <div className="bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-50" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="animate-float-slow absolute top-20 left-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <div className="animate-float-medium absolute top-40 right-20 h-24 w-24 rounded-full bg-purple-300/20 blur-2xl" />
        <div className="animate-float-fast absolute bottom-32 left-1/4 h-40 w-40 rounded-full bg-blue-300/15 blur-3xl" />
        <div className="animate-float-slow absolute right-10 bottom-20 h-28 w-28 rounded-full bg-white/10 blur-xl" />

        {/* Animated Stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="animate-twinkle-slow absolute"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            <Star className="h-2 w-2 fill-current text-white/30" />
          </div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <Badge
            variant="secondary"
            className="mb-6 inline-flex items-center space-x-2 border-white/30 bg-white/20 text-white hover:bg-white/30"
          >
            <Sparkles className="h-3 w-3" />
            <span>Start Your Journey Today</span>
          </Badge>

          <h2 className="mb-6 text-4xl leading-tight font-bold text-white md:text-6xl">
            Ready to{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Transform
            </span>{' '}
            Your Future?
          </h2>

          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-blue-100">
            Join over 50,000 students who have already started their learning journey with us.
            Don&apos;t just dream about your goals – achieve them with LearnHub.
          </p>

          {/* Trust Indicators */}
          <div className="mb-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <div className="flex items-center space-x-2 text-white/90">
              <Star className="h-5 w-5 fill-current text-yellow-400" />
              <span className="font-semibold">4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2 text-white/90">
              <Users className="h-5 w-5" />
              <span className="font-semibold">50,000+ Students</span>
            </div>
            <div className="flex items-center space-x-2 text-white/90">
              <BookOpen className="h-5 w-5" />
              <span className="font-semibold">1,200+ Courses</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content - Benefits */}
          <div className="space-y-8">
            <div>
              <h3 className="mb-6 text-2xl font-bold text-white md:text-3xl">
                What You&apos;ll Get:
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur-sm transition-all duration-300 hover:bg-white/15"
                  >
                    <div className="shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-white">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Offer */}
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-3 flex items-center space-x-2">
                <Heart className="h-5 w-5 fill-current text-red-400" />
                <span className="font-semibold text-yellow-300">Limited Time Offer</span>
              </div>
              <p className="mb-4 text-white">
                Get 50% off your first course when you sign up this month. Start learning with the
                world&apos;s best instructors today!
              </p>
              <div className="text-2xl font-bold text-white">
                <span className="text-lg text-white/60 line-through">$99</span>{' '}
                <span className="text-yellow-300">$49</span>
                <span className="ml-2 text-sm font-normal text-white/80">for first course</span>
              </div>
            </div>
          </div>

          {/* Right Content - CTA */}
          <div className="text-center lg:text-left">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg">
              <div className="mb-8">
                <div className="mx-auto mb-6 flex h-20 w-20 animate-pulse items-center justify-center rounded-2xl bg-linear-to-br from-yellow-400 to-orange-500 shadow-lg lg:mx-0">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>

                <h3 className="mb-4 text-3xl font-bold text-white">Start Learning Today</h3>

                <p className="mb-8 leading-relaxed text-blue-100">
                  Choose from thousands of courses across technology, business, design, and more.
                  Your journey to success starts with a single click.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  size="lg"
                  className="group w-full border-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 py-6 text-lg font-bold text-gray-900 shadow-lg transition-all duration-300 hover:from-yellow-500 hover:via-yellow-600 hover:to-orange-600 hover:shadow-xl"
                  asChild
                >
                  <Link href="/courses">
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 transform rounded-lg bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"></div>
                    <span className="relative z-10 flex items-center justify-center">
                      Explore Courses Now
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-white/30 bg-transparent py-6 font-semibold text-white backdrop-blur-sm hover:border-white/50 hover:bg-white/10"
                  asChild
                >
                  <Link href="/auth/sign-up">Create Free Account</Link>
                </Button>
              </div>

              {/* Money Back Guarantee */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-2 text-sm text-green-300">
                  <CheckCircle className="h-4 w-4" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>

            {/* Bottom Trust Signal */}
            <div className="mt-8 text-center lg:text-left">
              <p className="text-sm text-white/80">
                Trusted by learners from{' '}
                <span className="font-semibold text-yellow-300">150+ countries</span>
              </p>
              <div className="mt-2 flex items-center justify-center space-x-1 lg:justify-start">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                ))}
                <span className="ml-2 text-sm text-white/90">15,000+ five-star reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
