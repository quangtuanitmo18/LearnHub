'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, Sparkles, Code2, Zap } from 'lucide-react';
import Link from 'next/link';

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 md:pt-32">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 bg-linear-to-b from-primary/5 to-transparent dark:from-primary/10" />
      <div
        className="absolute inset-0 z-0 bg-size-[24px_24px]"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(var(--primary), 0.1) 1px, transparent 1px)',
        }}
      />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <Badge className="gap-2 px-4 py-2 text-sm font-medium" variant="outline">
              <Sparkles className="h-4 w-4" />
              Version 3.0 - Enterprise Ready
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Fullstack LMS Project
            <span className="bg-linear-to-r from-primary to-primary/60 block bg-clip-text text-transparent">
              From A to Z
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground mb-8 text-lg md:text-xl">
            Real-world E-Learning platform with modern <strong>Fullstack Architecture</strong>.
            <br />
            Built not just for learning, but to operate as a true commercial product.
          </p>

          {/* Tech Highlights */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-4">
            <div className="bg-background flex items-center gap-2 rounded-full border px-4 py-2 shadow-sm">
              <Code2 className="text-primary h-4 w-4" />
              <span className="text-sm font-medium">Next.js 15</span>
            </div>
            <div className="bg-background flex items-center gap-2 rounded-full border px-4 py-2 shadow-sm">
              <Zap className="text-primary h-4 w-4" />
              <span className="text-sm font-medium">NestJS + PostgreSQL</span>
            </div>
            <div className="bg-background flex items-center gap-2 rounded-full border px-4 py-2 shadow-sm">
              <Sparkles className="text-primary h-4 w-4" />
              <span className="text-sm font-medium">AI Chatbot</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2" asChild>
              <a
                href="https://github.com/quangtuanitmo18/LearnHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Source Code
                <Github className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Explore Features</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="bg-card rounded-lg border p-4">
              <div className="text-primary text-3xl font-bold">3.0</div>
              <div className="text-muted-foreground text-sm">Version</div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="text-primary text-3xl font-bold">50+</div>
              <div className="text-muted-foreground text-sm">Features</div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="text-primary text-3xl font-bold">10+</div>
              <div className="text-muted-foreground text-sm">Technologies</div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="text-primary text-3xl font-bold">100%</div>
              <div className="text-muted-foreground text-sm">Production Ready</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
