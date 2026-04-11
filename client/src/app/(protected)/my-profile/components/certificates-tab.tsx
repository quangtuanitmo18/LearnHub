'use client';

import React, { useCallback } from 'react';
import { useMyCertificates } from '@/hooks/use-certificate';
import { format } from 'date-fns';
import { Award, Calendar, CheckCircle2, Copy, Download, ExternalLink, Eye, Fingerprint, Loader2, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000';

const CertificatesTab = () => {
  const { data: certificates, isLoading } = useMyCertificates();

  const handleCopyLink = useCallback((certId: string) => {
    const url = `${SITE_URL}/certificate/${certId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Verification link copied to clipboard!');
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between sm:flex-row sm:items-end">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
            <Award className="h-6 w-6 text-amber-500" />
            My Certificates
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View, download, and share your earned certificates.
          </p>
        </div>
        {certificates && certificates.length > 0 && (
          <p className="mt-2 text-sm text-gray-500 sm:mt-0">
            {certificates.length} certificate
            {certificates.length !== 1 ? 's' : ''} earned
          </p>
        )}
      </div>

      <Separator />

      {!certificates || certificates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-20 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <Award className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            No certificates yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
            Complete all lessons in a course to claim your first certificate!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {certificates.map((cert) => (
            <Card
              key={cert.id}
              className="group relative cursor-default overflow-hidden border-0 bg-linear-to-br from-white via-amber-50/30 to-yellow-50/30 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:from-gray-900 dark:via-amber-950/20 dark:to-yellow-950/20"
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 h-24 w-24 animate-pulse rounded-full bg-linear-to-br from-amber-400/20 to-yellow-400/20 blur-xl sm:h-32 sm:w-32" />
                <div className="absolute bottom-0 left-0 h-20 w-20 animate-pulse rounded-full bg-linear-to-br from-orange-400/20 to-red-400/20 blur-xl delay-1000 sm:h-24 sm:w-24" />
              </div>

              {/* Main Content */}
              <div className="relative z-10 p-4 sm:p-5 md:p-6">
                {/* Certificate mini preview */}
                <div className="mb-4 flex items-start gap-3 sm:mb-5 sm:gap-4 md:gap-5">
                  {/* Certificate Icon */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-yellow-200 shadow-md ring-2 ring-white/50 sm:h-20 sm:w-20 sm:rounded-2xl sm:ring-4 dark:from-amber-900/40 dark:to-yellow-900/40 dark:ring-gray-800/50">
                    <Award className="h-8 w-8 text-amber-600 sm:h-10 sm:w-10 dark:text-amber-400" />
                  </div>

                  {/* Certificate Info */}
                  <div className="min-w-0 flex-1">
                    {/* Verified Badge */}
                    <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:mb-3">
                      <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600 sm:text-xs dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </div>
                      <div className="ml-auto">
                        <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-medium text-white shadow-md sm:px-3 sm:py-1 sm:text-xs">
                          Certificate
                        </span>
                      </div>
                    </div>

                    {/* Course Title */}
                    <h3 className="mb-1 line-clamp-2 text-sm leading-tight font-bold text-gray-900 sm:text-base dark:text-white">
                      {cert.course?.title}
                    </h3>
                    {cert.course?.author?.username && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        by{' '}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {cert.course.author.username}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-2 rounded-lg bg-white/60 p-3 backdrop-blur-sm sm:space-y-3 sm:p-4 dark:bg-gray-800/40">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Issued On</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {cert.issuedAt
                        ? format(new Date(cert.issuedAt), 'MMM dd, yyyy')
                        : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <Fingerprint className="h-3.5 w-3.5" />
                      <span>Certificate ID</span>
                    </div>
                    <span className="rounded border bg-gray-50 px-2 py-0.5 font-mono text-[10px] tracking-wider sm:text-xs dark:border-gray-600 dark:bg-gray-700">
                      {cert.id.substring(0, 12)}…
                    </span>
                  </div>
                </div>

                {/* Action buttons row */}
                <div className="mt-4 flex gap-2 sm:gap-3">
                  <Link
                    href={`/certificate/${cert.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-xs shadow-md transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 text-xs transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleCopyLink(cert.id)}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </Button>
                  <Link
                    href={`/courses/${cert.course?.slug}`}
                    className="hidden sm:block"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Course
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Subtle border glow on hover */}
              <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesTab;
