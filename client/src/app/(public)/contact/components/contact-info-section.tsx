'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building,
  Calendar,
  Clock,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from 'lucide-react';
import Link from 'next/link';

const ContactInfoSection = () => {
  const offices = [
    {
      city: 'San Francisco',
      type: 'Headquarters',
      address: '123 Innovation Drive, Suite 400',
      zipCode: 'San Francisco, CA 94107',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      email: 'sf@learnhub.com',
      hours: 'Mon-Fri: 9:00 AM - 6:00 PM PST',
      timezone: 'Pacific Time',
      mapUrl: 'https://maps.google.com',
      isPrimary: true,
    },
    {
      city: 'New York',
      type: 'East Coast Office',
      address: '789 Broadway, Floor 15',
      zipCode: 'New York, NY 10003',
      country: 'United States',
      phone: '+1 (555) 987-6543',
      email: 'ny@learnhub.com',
      hours: 'Mon-Fri: 9:00 AM - 6:00 PM EST',
      timezone: 'Eastern Time',
      mapUrl: 'https://maps.google.com',
      isPrimary: false,
    },
    {
      city: 'London',
      type: 'European Office',
      address: '45 Finsbury Square',
      zipCode: 'London EC2A 1PX',
      country: 'United Kingdom',
      phone: '+44 20 7946 0958',
      email: 'london@learnhub.com',
      hours: 'Mon-Fri: 9:00 AM - 5:00 PM GMT',
      timezone: 'Greenwich Mean Time',
      mapUrl: 'https://maps.google.com',
      isPrimary: false,
    },
  ];

  const socialLinks = [
    {
      name: 'Twitter',
      handle: '@LearnHubEdu',
      url: 'https://twitter.com/learnhub',
      icon: Twitter,
      color: 'text-blue-500',
      followers: '45K',
    },
    {
      name: 'LinkedIn',
      handle: 'LearnHub',
      url: 'https://linkedin.com/company/learnhub',
      icon: Linkedin,
      color: 'text-blue-700',
      followers: '120K',
    },
    {
      name: 'Facebook',
      handle: 'LearnHubEducation',
      url: 'https://facebook.com/learnhub',
      icon: Facebook,
      color: 'text-blue-600',
      followers: '85K',
    },
    {
      name: 'Instagram',
      handle: '@learnhub_edu',
      url: 'https://instagram.com/learnhub',
      icon: Instagram,
      color: 'text-pink-600',
      followers: '30K',
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <Badge variant="secondary" className="mb-4 inline-flex items-center space-x-2">
            <MapPin className="h-3 w-3" />
            <span>Find Us Worldwide</span>
          </Badge>
          <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Our{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Global Presence
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
            We&apos;re here to support you around the world. Find the best way to reach our team or
            visit one of our offices.
          </p>
        </div>

        {/* Office Locations */}
        <div className="mb-16">
          <h3 className="mb-12 text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Office Locations
          </h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {offices.map((office, index) => (
              <Card
                key={index}
                className={`group relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-2xl ${
                  office.isPrimary ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                {office.isPrimary && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Headquarters
                    </Badge>
                  </div>
                )}

                {/* Background Gradient */}
                <div className="absolute inset-0 bg-linear-to-br from-blue-50/0 to-purple-50/0 transition-all duration-300 group-hover:from-blue-50/100 group-hover:to-purple-50/50" />

                <CardContent className="relative z-10 p-6">
                  {/* City & Type */}
                  <div className="mb-6">
                    <div className="mb-2 flex items-center space-x-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-purple-600">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{office.city}</h4>
                        <p className="text-sm font-medium text-blue-600">{office.type}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mb-6 space-y-4">
                    <div className="flex items-start space-x-3">
                      <Building className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                      <div className="text-gray-600">
                        <p>{office.address}</p>
                        <p>{office.zipCode}</p>
                        <p className="font-medium">{office.country}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 shrink-0 text-gray-400" />
                      <a
                        href={`tel:${office.phone.replace(/\s/g, '')}`}
                        className="text-blue-600 hover:underline"
                      >
                        {office.phone}
                      </a>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 shrink-0 text-gray-400" />
                      <a href={`mailto:${office.email}`} className="text-blue-600 hover:underline">
                        {office.email}
                      </a>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                      <div className="text-gray-600">
                        <p>{office.hours}</p>
                        <p className="text-sm text-gray-500">{office.timezone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:border-blue-200 group-hover:bg-blue-50"
                      asChild
                    >
                      <Link href={office.mapUrl} target="_blank">
                        <MapPin className="mr-2 h-4 w-4" />
                        View on Map
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                      asChild
                    >
                      <Link href="#contact-form">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Visit
                      </Link>
                    </Button>
                  </div>
                </CardContent>

                {/* Decorative Elements */}
                <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-linear-to-br from-blue-400 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Card>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="mb-12 text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Connect with Us on Social Media
          </h3>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <Card
                  key={index}
                  className="group border-0 text-center shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 transition-transform duration-300 group-hover:scale-110">
                        <Icon className={`h-8 w-8 ${social.color}`} />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{social.name}</h4>
                        <p className="mb-1 text-sm text-gray-600">{social.handle}</p>
                        <p className="text-xs text-gray-500">{social.followers} followers</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full group-hover:bg-gray-50"
                        asChild
                      >
                        <Link href={social.url} target="_blank">
                          Follow
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactInfoSection;
