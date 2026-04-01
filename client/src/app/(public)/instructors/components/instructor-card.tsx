'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Globe, Linkedin, Youtube, ArrowRight, GraduationCap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { IInstructor } from '@/types/instructor';

interface InstructorCardProps {
  instructor: IInstructor;
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  const courseCount = instructor._count?.courses ?? 0;
  const profile = instructor.instructorProfile;
  const initials = instructor.username?.slice(0, 2).toUpperCase() ?? 'IN';

  return (
    <Link
      href={`/instructors/${instructor.username}`}
      className="group block"
      aria-label={`View ${instructor.username}'s instructor profile`}
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
        {/* Top gradient bar */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-emerald-400 to-teal-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="flex flex-col items-center p-6 text-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 shadow-lg ring-4 ring-white transition-all duration-300 group-hover:ring-emerald-100">
              <AvatarImage src={instructor.avatar ?? undefined} alt={instructor.username} />
              <AvatarFallback className="bg-linear-to-br from-emerald-500 to-teal-600 text-2xl font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Online indicator */}
            <span className="absolute right-1 bottom-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
          </div>

          {/* Name */}
          <h3 className="mb-1 text-lg font-bold text-gray-900 transition-colors duration-200 group-hover:text-emerald-700">
            {instructor.username}
          </h3>

          {/* Headline */}
          {profile?.headline && (
            <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500">
              {profile.headline}
            </p>
          )}

          {/* Course count badge */}
          <Badge
            variant="secondary"
            className="mb-4 gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            <BookOpen className="h-3 w-3" />
            {courseCount} {courseCount === 1 ? 'Course' : 'Courses'}
          </Badge>

          {/* Social links */}
          {(profile?.website || profile?.linkedin || profile?.youtube) && (
            <div className="mb-4 flex items-center gap-3">
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-400 transition-colors hover:text-emerald-600"
                  aria-label="Website"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-400 transition-colors hover:text-blue-600"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {profile.youtube && (
                <a
                  href={profile.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-400 transition-colors hover:text-red-600"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-auto border-t border-gray-100 px-6 py-4">
          <span className="inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium text-emerald-600 transition-colors group-hover:text-emerald-800">
            View Profile
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export function InstructorCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col items-center p-6 text-center">
        <div className="mb-4 h-24 w-24 animate-pulse rounded-full bg-gray-200" />
        <div className="mb-2 h-5 w-32 animate-pulse rounded-md bg-gray-200" />
        <div className="mb-1 h-3 w-48 animate-pulse rounded-md bg-gray-100" />
        <div className="mb-4 h-3 w-40 animate-pulse rounded-md bg-gray-100" />
        <div className="mb-4 h-6 w-20 animate-pulse rounded-full bg-gray-200" />
      </div>
      <div className="mt-auto border-t border-gray-100 px-6 py-4">
        <div className="mx-auto h-4 w-24 animate-pulse rounded-md bg-gray-200" />
      </div>
    </div>
  );
}
