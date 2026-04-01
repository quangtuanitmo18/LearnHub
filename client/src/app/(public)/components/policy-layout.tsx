import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function PolicyLayout({ title, lastUpdated, icon: Icon, children }: PolicyLayoutProps) {
  return (
    <div className="dark:bg-background relative min-h-screen bg-gray-50/50 pb-20">
      {/* Absolute Ambient Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="dark:bg-primary/10 absolute top-0 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 rounded-full blur-[100px]" />
      </div>

      {/* Header Banner */}
      <div className="border-primary/10 dark:border-primary/5 dark:bg-background/40 relative border-b bg-white/40 pt-24 pb-16 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8 flex justify-center">
            <div className="bg-primary/10 ring-primary/20 dark:bg-primary/20 relative rounded-3xl p-5 shadow-sm ring-1">
              <div className="bg-primary/20 absolute inset-0 animate-ping rounded-3xl opacity-20" />
              <Icon
                className="text-primary relative z-10 h-10 w-10 md:h-12 md:w-12"
                strokeWidth={1.5}
              />
            </div>
          </div>
          <h1 className="from-foreground to-foreground/70 mb-4 bg-linear-to-br bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg font-medium md:text-xl">
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative container mx-auto mt-[-40px] px-4 md:mt-[-60px]">
        <div className="shadow-primary/5 dark:bg-card/80 dark:hover:bg-card/90 mx-auto max-w-4xl rounded-3xl border border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-xl transition-all hover:bg-white/90 md:p-14 dark:border-white/10">
          <div className="prose-h2:mb-4 prose-h2:mt-10 prose-h2:text-2xl prose-h2:font-bold prose-h2:text-foreground prose-h3:mb-3 prose-h3:mt-8 prose-h3:text-xl prose-h3:font-semibold prose-h3:text-foreground prose-p:mb-6 prose-p:leading-relaxed prose-p:text-muted-foreground prose-ul:mb-6 prose-ul:list-disc prose-ul:space-y-2 prose-ul:pl-6 prose-ul:text-muted-foreground prose-ol:mb-6 prose-ol:list-decimal prose-ol:space-y-2 prose-ol:pl-6 prose-ol:text-muted-foreground prose-strong:font-semibold prose-strong:text-foreground relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
