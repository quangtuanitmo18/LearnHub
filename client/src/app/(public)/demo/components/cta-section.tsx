'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Github, Heart } from 'lucide-react';

function CTASection() {
  return (
    <section className="from-primary/10 via-primary/5 to-background relative overflow-hidden bg-linear-to-br py-12 md:py-16">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">Ready to Explore?</h2>
          <p className="text-muted-foreground mb-8 text-lg md:text-xl">
            Experience a modern LMS platform packed with full production-ready features.
            <br />
            If you find this project helpful, please leave a ⭐ on GitHub!
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 px-8" asChild>
              <a
                href="https://github.com/quangtuanitmo18/LearnHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                View on GitHub
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Support Message */}
          <div className="bg-card mt-12 rounded-xl border p-6 shadow-lg">
            <div className="mb-3 flex items-center justify-center gap-2 text-lg font-semibold">
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
              Support the Project
            </div>
            <p className="text-muted-foreground text-sm">
              If this open-source project helps you in your learning journey or career, don&apos;t
              forget to drop a comment and star the repository! Thank you so much for your support!
            </p>
          </div>

          {/* Tech Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <img
              src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js"
              alt="Next.js"
              className="h-7"
            />
            <img
              src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white"
              alt="NestJS"
              className="h-7"
            />
            <img
              src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white"
              alt="PostgreSQL"
              className="h-7"
            />
            <img
              src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"
              alt="TypeScript"
              className="h-7"
            />
            <img
              src="https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"
              alt="Tailwind"
              className="h-7"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
