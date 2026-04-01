'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface Version {
  version: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  description: string;
  features: string[];
  badge?: string;
}

const versions: Version[] = [
  {
    version: 'V3.0',
    title: 'Enterprise Scale LMS',
    status: 'current',
    badge: 'Current Version',
    description:
      'A production-ready platform with full-stack capabilities, modern architecture, and enterprise features.',
    features: [
      'Next.js 15 App Router & React 19',
      'NestJS Module-based Backend',
      'PostgreSQL & Prisma ORM',
      'AI Chatbot integration (Gemini)',
      'Realtime features (Socket.IO)',
      'Advanced RBAC security system',
      'Multiple payment gateways (Stripe, VietQR)',
      'Video streaming (HLS + MUX)',
      'BullMQ background jobs & Redis caching',
    ],
  },
];

function VersionsSection() {
  function getStatusColor(status: Version['status']) {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-200 dark:border-green-900';
      case 'current':
        return 'bg-blue-500/10 text-blue-500 border-blue-200 dark:border-blue-900';
      case 'upcoming':
        return 'bg-purple-500/10 text-purple-500 border-purple-200 dark:border-purple-900';
    }
  }

  return (
    <section className="bg-muted/30 py-12 md:py-16" id="versions">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <Badge className="mb-4" variant="outline">
            Roadmap
          </Badge>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Current Version</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Built and optimized for enterprise-scale deployments.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          {versions.map((version, index) => (
            <Card
              key={version.version}
              className={`relative transition-all hover:shadow-lg ${getStatusColor(
                version.status,
              )}`}
            >
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="outline" className="font-bold">
                    {version.version}
                  </Badge>
                  {version.badge && (
                    <Badge className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      {version.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{version.title}</CardTitle>
                <CardDescription className="text-sm">{version.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {version.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default VersionsSection;
