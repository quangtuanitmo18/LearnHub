'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Users,
  MessageSquare,
  CreditCard,
  LineChart,
  Shield,
  Smartphone,
  Video,
  FileText,
  HelpCircle,
} from 'lucide-react';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  tags: string[];
}

const features: Feature[] = [
  {
    icon: BookOpen,
    title: 'Advanced Course Management',
    description:
      'Create and manage courses with multiple chapters and lessons. Support for rich content including videos, articles, and quizzes.',
    color: 'text-blue-500',
    tags: ['Drag & Drop', 'Rich Text', 'Progress Tracking'],
  },
  {
    icon: Video,
    title: 'HLS Video Streaming',
    description:
      'Smooth video playback with adaptive bitrate streaming via MUX. Prevents unauthorized downloading and protects your content.',
    color: 'text-purple-500',
    tags: ['MUX', 'Adaptive Bitrate', 'Secure'],
  },
  {
    icon: HelpCircle,
    title: 'Interactive Quizzes',
    description:
      'Multiple choice tests, essays, and interactive exercises to assess student understanding with automatic grading and feedback.',
    color: 'text-green-500',
    tags: ['Auto Grading', 'Analytics', 'Time Limits'],
  },
  {
    icon: MessageSquare,
    title: 'AI Chatbot & Realtime Chat',
    description:
      'Instant student support with Gemini AI integration. Community discussion forums and real-time private messaging using Socket.IO.',
    color: 'text-orange-500',
    tags: ['Gemini AI', 'Socket.IO', 'Forums'],
  },
  {
    icon: CreditCard,
    title: 'Flexible Payments',
    description:
      'Integrated VietQR for instant local transfers and Stripe for international credit card payments. Includes discount code system.',
    color: 'text-yellow-500',
    tags: ['VietQR', 'Stripe', 'Coupons'],
  },
  {
    icon: LineChart,
    title: 'Analytics Dashboard',
    description:
      'Detailed revenue reports, student enrollment statistics, and course engagement tracking with intuitive visual charts.',
    color: 'text-cyan-500',
    tags: ['Recharts', 'Export Data', 'Real-time'],
  },
  {
    icon: Users,
    title: 'Student Management',
    description:
      'Track learning progress, manage enrollments, monitor completion rates, and issue certificates to your learners.',
    color: 'text-indigo-500',
    tags: ['Profiles', 'Progress', 'Certificates'],
  },
  {
    icon: Shield,
    title: 'Security & Auth',
    description:
      'Robust role-based access control (RBAC), OAuth2 login (Google/Github), and secure JWT sessions with refresh tokens mechanism.',
    color: 'text-red-500',
    tags: ['RBAC', 'OAuth2', 'JWT'],
  },
];

function FeaturesSection() {
  return (
    <section className="bg-muted/30 py-12 md:py-16" id="features">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <Badge className="mb-4" variant="outline">
            Key Features
          </Badge>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Everything You Need To Build An LMS
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            A comprehensive set of tools and features to create, manage, and sell online courses
            effectively.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group border-muted hover:border-primary/50 relative overflow-hidden transition-all hover:shadow-lg"
              >
                {/* Decorative gradient background */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom_right,transparent,transparent,var(--muted))] opacity-0 transition-opacity group-hover:opacity-100" />

                <CardHeader>
                  <div className="bg-background ring-border mb-4 flex h-12 w-12 items-center justify-center rounded-lg shadow-sm ring-1">
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 text-sm">{feature.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {feature.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
