"use client";

import { AnimatedCounter } from "@/components/animated-counter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTE_CONFIG } from "@/configs/routes";
import { ArrowRight, BookOpen, CheckCircle, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SlSocialYoutube } from "react-icons/sl";
// Hero section component - Arrow function
const HeroSection = () => {
  const stats = [
    { icon: Users, label: "Students", value: "50,000+" },
    { icon: BookOpen, label: "Courses", value: "1,200+" },
    { icon: Star, label: "Rating", value: "4.9/5" },
  ];

  const features = [
    "Expert-led courses",
    "Lifetime access",
    "Certificate of completion",
    "Mobile & desktop learning",
  ];

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="container mx-auto px-4 sm:px-6  py-12 sm:py-16 md:py-20 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Badge */}
            <Badge
              variant="secondary"
              className="inline-flex items-center space-x-1 text-xs sm:text-sm mx-auto lg:mx-0"
            >
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
              <span>Rated #1 Online Learning Platform</span>
            </Badge>

            {/* Main Heading */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl  xl:text-7xl font-bold leading-tight">
                Learn Skills That{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Matter
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Transform your career with industry-relevant courses taught by
                world-class instructors. Start learning today and unlock your
                potential.
              </p>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-md mx-auto lg:mx-0">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 justify-center lg:justify-start"
                >
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
                  <span className="text-sm sm:text-base text-gray-600">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0 w-full">
              {/* Primary CTA - Start Learning */}
              <Button
                size="lg"
                className="relative text-sm sm:text-base px-6 sm:px-8 h-12 sm:h-14 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl font-semibold overflow-hidden group border-0 w-full sm:flex-1"
                asChild
              >
                <Link href={ROUTE_CONFIG.COURSES}>
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                    Start Learning
                  </span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>

              {/* Secondary CTA - Watch Demo */}
              <Button
                variant="ghost"
                size="lg"
                className="relative text-sm sm:text-base px-6 sm:px-8 h-12 sm:h-14 text-gray-700 hover:text-blue-600 transition-all duration-300 group hover:bg-linear-to-br hover:from-blue-50 hover:via-blue-100/50 hover:to-purple-50 hover:shadow-xl hover:shadow-blue-200/25 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-300 overflow-hidden w-full sm:flex-1"
                asChild
              >
                <Link
                  href="https://www.youtube.com/watch?v=B1UvPId3hxY"
                  target="_blank"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-xl transition-all duration-300"></div>
                  <SlSocialYoutube className="mr-2 h-4 w-4 sm:h-5 sm:w-5 relative z-10 group-hover:scale-110 transition-transform duration-300 fill-current" />
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                    Watch Demo
                  </span>
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-4 sm:gap-6 lg:gap-8 pt-2 sm:pt-4 justify-center lg:justify-start">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-2 min-w-0"
                  >
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg shrink-0">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                        <AnimatedCounter value={stat.value} duration={2000} />
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 truncate">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Content - Hero Illustration */}
          <div className="relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[600px] mx-auto lg:mx-0 order-first lg:order-last">
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
              className="object-cover object-center relative z-10"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
