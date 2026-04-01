'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';

function VideoDemoSection() {
  return (
    <section className="bg-muted/30 py-12 md:py-16" id="video-demo">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <Badge className="mb-4 gap-2" variant="outline">
            <Play className="h-3 w-3" />
            Video Demo
          </Badge>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Watch Demo In Action</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Explore the LearnHub platform in action - from the intuitive user interface to the
            advanced backend features.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <Card className="overflow-hidden border-2 shadow-2xl">
            <CardContent className="p-0">
              {/* Responsive video container with 16:9 aspect ratio */}
              <div className="relative aspect-video w-full">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/B1UvPId3hxY"
                  title="LearnHub LMS Platform Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>

          {/* Video highlights */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="bg-card rounded-lg border p-4 text-center">
              <div className="text-primary mb-2 text-2xl font-bold">🎨</div>
              <div className="text-sm font-medium">Modern UI/UX</div>
              <div className="text-muted-foreground text-xs">Shadcn UI & Tailwind CSS</div>
            </div>
            <div className="bg-card rounded-lg border p-4 text-center">
              <div className="text-primary mb-2 text-2xl font-bold">⚡</div>
              <div className="text-sm font-medium">Realtime Features</div>
              <div className="text-muted-foreground text-xs">Socket.IO & AI Chatbot</div>
            </div>
            <div className="bg-card rounded-lg border p-4 text-center">
              <div className="text-primary mb-2 text-2xl font-bold">🚀</div>
              <div className="text-sm font-medium">Production Ready</div>
              <div className="text-muted-foreground text-xs">Full-stack setup</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VideoDemoSection;
