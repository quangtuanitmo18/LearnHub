export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { InstructorsService } from '@/services/instructors';
import { CourseCard } from '@/components/course/course-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, Linkedin, Youtube, BookOpen, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
interface InstructorProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

async function fetchInstructorData(username: string) {
  try {
    const response = await InstructorsService.getInstructorByUsername(username);
    return response.data;
  } catch {
    return null;
  }
}

export default async function InstructorProfilePage({ params }: InstructorProfilePageProps) {
  const resolvedParams = await params;
  const instructor = await fetchInstructorData(resolvedParams.username);

  if (!instructor) {
    notFound();
  }

  const profile = instructor.instructorProfile;
  const initials = instructor.username?.slice(0, 2).toUpperCase() ?? 'IN';
  const courses = instructor.courses || [];
  const joinedDate = new Date(instructor.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/instructors" className="hover:text-emerald-600">
            Instructors
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900">{instructor.username}</span>
        </nav>

        {/* Profile Header */}
        <div className="mb-12 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
            {/* Avatar */}
            <Avatar className="h-32 w-32 shrink-0 shadow-xl ring-4 ring-emerald-50">
              <AvatarImage src={instructor.avatar ?? undefined} alt={instructor.username} />
              <AvatarFallback className="bg-linear-to-br from-emerald-500 to-teal-600 text-4xl font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">{instructor.username}</h1>
              {profile?.headline && (
                <p className="mb-4 text-lg font-medium text-emerald-700">{profile.headline}</p>
              )}

              <div className="mb-6 flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-gray-900">
                    {instructor._count?.courses ?? 0}
                  </span>{' '}
                  Courses
                </div>
                <div className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  <span>Joined {joinedDate}</span>
                </div>
              </div>

              {/* Social Links */}
              {(profile?.website || profile?.linkedin || profile?.youtube) && (
                <div className="flex items-center gap-4">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-gray-50 p-2.5 text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                      aria-label="Website"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-gray-50 p-2.5 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {profile.youtube && (
                    <a
                      href={profile.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-gray-50 p-2.5 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label="YouTube"
                    >
                      <Youtube className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <div className="mt-8 border-t border-gray-100 pt-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900">About Me</h2>
              <div className="prose prose-emerald max-w-none leading-relaxed text-gray-600">
                {profile.bio.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Courses Section */}
        <div>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Courses by <span className="text-emerald-600">{instructor.username}</span>
            </h2>
            <Badge variant="outline" className="border-gray-200 px-3 py-1">
              {courses.length} {courses.length === 1 ? 'course' : 'courses'}
            </Badge>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course: any) => (
                <CourseCard
                  key={course.id}
                  course={{ ...course, author: { username: instructor.username } }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-100 bg-white p-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-1 text-lg font-medium text-gray-900">No courses yet</h3>
              <p className="text-gray-500">
                This instructor hasn&apos;t published any courses yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
