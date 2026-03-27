'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Clock,
  HeadphonesIcon,
  Mail,
  MessageCircle,
  Phone,
  Star,
  Users,
} from 'lucide-react';
import Link from 'next/link';

const HeroSection = () => {
  const contactMethods = [
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Mon-Fri 9AM-6PM EST',
      value: '+1 (555) 123-4567',
      action: 'Call Now',
      href: 'tel:+15551234567',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get response within 2 hours',
      value: 'support@learnhub.com',
      action: 'Send Email',
      href: 'mailto:support@learnhub.com',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Available 24/7',
      value: 'Chat with our team',
      action: 'Start Chat',
      href: '#chat',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="bg-grid-slate-100 absolute inset-0 -z-10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

      {/* Floating Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-slow absolute top-20 left-10 h-32 w-32 rounded-full bg-blue-200/20 blur-xl" />
        <div className="animate-float-medium absolute top-40 right-20 h-24 w-24 rounded-full bg-purple-200/20 blur-2xl" />
        <div className="animate-float-fast absolute bottom-32 left-1/4 h-40 w-40 rounded-full bg-green-200/15 blur-3xl" />

        {/* Animated Icons */}
        <div className="animate-float-medium absolute top-16 right-1/4">
          <div className="flex h-12 w-12 rotate-12 items-center justify-center rounded-xl bg-blue-500/10">
            <HeadphonesIcon className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <div className="animate-float-slow absolute right-8 bottom-20">
          <div className="flex h-10 w-10 -rotate-12 items-center justify-center rounded-lg bg-purple-500/10">
            <MessageCircle className="h-5 w-5 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <Badge variant="secondary" className="inline-flex items-center space-x-2">
              <HeadphonesIcon className="h-3 w-3" />
              <span>We&apos;re Here to Help</span>
            </Badge>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                Get in{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Touch
                </span>{' '}
                with Us
              </h1>
              <p className="max-w-lg text-xl leading-relaxed text-gray-600">
                Have questions about our courses? Need technical support? Our friendly team is ready
                to help you succeed on your learning journey.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Response within 2 hours</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Star className="h-5 w-5 fill-current text-yellow-500" />
                <span className="text-sm font-medium">4.9/5 Support Rating</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">24/7 Community Help</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="px-8 text-base" asChild>
                <Link href="#contact-form">
                  Send us a Message
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 text-base" asChild>
                <Link href="/help">
                  <HeadphonesIcon className="mr-2 h-4 w-4" />
                  Browse Help Center
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Contact Methods */}
          <div className="space-y-6">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
                Choose Your Preferred Way to Connect
              </h2>
              <p className="text-gray-600">
                Multiple ways to reach us - pick what works best for you.
              </p>
            </div>

            <div className="space-y-4">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <div
                    key={index}
                    className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:border-blue-200 hover:shadow-2xl"
                  >
                    {/* Background Gradient on Hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50/0 to-purple-50/0 transition-all duration-300 group-hover:from-blue-50/50 group-hover:to-purple-50/30" />

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`h-12 w-12 ${method.bgColor} flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110`}
                        >
                          <Icon className={`h-6 w-6 ${method.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{method.title}</h3>
                          <p className="mb-1 text-sm text-gray-600">{method.description}</p>
                          <p className={`text-sm font-medium ${method.color}`}>{method.value}</p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className={`opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-blue-50 ${method.color}`}
                        asChild
                      >
                        <Link href={method.href}>
                          {method.action}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    {/* Decorative Element */}
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-linear-to-br from-blue-400 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                );
              })}
            </div>

            {/* Emergency Contact */}
            <div className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 p-6">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <Phone className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Emergency Support</h4>
                  <p className="text-sm text-gray-600">
                    For urgent technical issues:{' '}
                    <span className="font-medium text-red-600">+1 (555) 999-0000</span>
                  </p>
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
