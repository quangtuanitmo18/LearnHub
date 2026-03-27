'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Eye, Heart, Shield, Users, Zap, BookOpen, Globe, Lightbulb } from 'lucide-react';

// Mission section component - Arrow function
const MissionSection = () => {
  const missionVision = [
    {
      icon: Target,
      title: 'Our Mission',
      description:
        'To democratize quality education by making it accessible, affordable, and effective for learners worldwide. We strive to bridge the gap between ambition and achievement through innovative online learning experiences.',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Eye,
      title: 'Our Vision',
      description:
        "To become the world's leading platform for transformative education, empowering millions of learners to unlock their potential and create a more knowledgeable, skilled, and connected global community.",
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  const coreValues = [
    {
      icon: Heart,
      title: 'Student-Centric',
      description:
        "Everything we do is designed with our students' success and learning experience at the heart of our decisions.",
      color: 'text-red-500',
      bgColor: 'from-red-50 to-red-100',
    },
    {
      icon: Shield,
      title: 'Quality Excellence',
      description:
        'We maintain the highest standards in course content, instructor expertise, and platform reliability.',
      color: 'text-blue-500',
      bgColor: 'from-blue-50 to-blue-100',
    },
    {
      icon: Users,
      title: 'Inclusive Community',
      description:
        'We foster a diverse, supportive learning environment where everyone can thrive regardless of background.',
      color: 'text-green-500',
      bgColor: 'from-green-50 to-green-100',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description:
        'We continuously evolve our technology and teaching methods to provide cutting-edge learning experiences.',
      color: 'text-yellow-500',
      bgColor: 'from-yellow-50 to-yellow-100',
    },
    {
      icon: BookOpen,
      title: 'Lifelong Learning',
      description:
        'We believe in the power of continuous education and support learners at every stage of their journey.',
      color: 'text-purple-500',
      bgColor: 'from-purple-50 to-purple-100',
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description:
        "We're committed to making a positive difference in communities worldwide through accessible education.",
      color: 'text-cyan-500',
      bgColor: 'from-cyan-50 to-cyan-100',
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <Badge variant="secondary" className="mb-4 inline-flex items-center space-x-2">
            <Lightbulb className="h-3 w-3" />
            <span>What Drives Us</span>
          </Badge>
          <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Our{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Purpose
            </span>{' '}
            & Values
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
            Discover the principles and beliefs that guide everything we do, from course creation to
            community building.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="mb-20 grid gap-8 md:grid-cols-2">
          {missionVision.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-2xl"
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${item.gradient} opacity-5 transition-opacity duration-300 group-hover:opacity-10`}
                />

                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`flex h-16 w-16 items-center justify-center bg-linear-to-br ${item.gradient} rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-xl`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 md:text-3xl">
                      {item.title}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 pt-0">
                  <p className="text-lg leading-relaxed text-gray-600">{item.description}</p>
                </CardContent>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-linear-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-gradient-to-tr from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Card>
            );
          })}
        </div>

        {/* Core Values */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Our Core{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Values
              </span>
            </h3>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              These fundamental beliefs shape our culture, guide our decisions, and define how we
              serve our learning community.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="group relative cursor-pointer overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-xl"
                >
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${value.bgColor} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />

                  <CardContent className="relative z-10 p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm transition-shadow duration-300 group-hover:shadow-md">
                      <Icon className={`h-6 w-6 ${value.color}`} />
                    </div>

                    <h4 className="mb-3 text-lg font-semibold text-gray-900">{value.title}</h4>

                    <p className="text-sm leading-relaxed text-gray-600">{value.description}</p>
                  </CardContent>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-300 group-hover:border-white/20" />
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="mt-16 text-center">
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute inset-0 rotate-1 transform rounded-2xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10" />
            <div className="relative rounded-2xl bg-white p-8 shadow-lg md:p-12">
              <div className="mb-4 text-6xl leading-none text-blue-200">&quot;</div>
              <blockquote className="mb-6 text-xl leading-relaxed font-medium text-gray-700 md:text-2xl">
                Education is the most powerful weapon which you can use to change the world.
                We&apos;re here to put that weapon in everyone&apos;s hands.
              </blockquote>
              <div className="flex items-center justify-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">LearnHub Team</p>
                  <p className="text-sm text-gray-600">Passionate Educators</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
