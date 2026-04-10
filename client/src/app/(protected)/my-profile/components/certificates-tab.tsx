'use client';

import React, { useCallback } from 'react';
import { useMyCertificates } from '@/hooks/use-certificate';
import { format } from 'date-fns';
import { Award, CheckCircle2, Copy, ExternalLink, Eye, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000';

function getImageUrl(image?: { cdnBaseUrl: string; storageKey: string } | null) {
  if (!image) return null;
  return `${image.cdnBaseUrl}/${image.storageKey}`;
}

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
          {certificates.map((cert) => {
            const imageUrl = getImageUrl(cert.course?.image);
            return (
              <div
                key={cert.id}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                {/* Certificate preview thumbnail */}
                <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-100 p-6 dark:from-amber-900/20 dark:to-yellow-900/20">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`Certificate for ${cert.course?.title}`}
                      fill
                      className="object-contain opacity-15"
                    />
                  ) : null}

                  {/* Certificate mini-view */}
                  <div className="z-10 w-full space-y-3 rounded-xl border border-amber-200 bg-white/95 p-4 text-center shadow-sm backdrop-blur-sm dark:border-amber-800 dark:bg-gray-900/95">
                    <Award className="mx-auto h-10 w-10 text-amber-500" />
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-amber-600 uppercase">
                        Certificate of Completion
                      </p>
                      <p className="mt-1 line-clamp-2 font-serif text-sm font-semibold text-gray-900 dark:text-white">
                        {cert.course?.title}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Verified by LearnHub</span>
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link
                      href={`/certificate/${cert.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="default"
                        size="sm"
                        className="w-44 gap-2 bg-amber-500 hover:bg-amber-600"
                      >
                        <Eye className="h-4 w-4" />
                        View & Download
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-44 gap-2"
                      onClick={() => handleCopyLink(cert.id)}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Verify Link
                    </Button>
                    <Link
                      href={`/courses/${cert.course?.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-44 gap-2 text-white hover:text-white"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Course
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 sm:p-5">
                  <h3
                    className="line-clamp-1 text-base font-semibold text-gray-900 dark:text-white"
                    title={cert.course?.title}
                  >
                    {cert.course?.title}
                  </h3>
                  {cert.course?.author?.username && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      by{' '}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {cert.course.author.username}
                      </span>
                    </p>
                  )}

                  <div className="mt-3 flex flex-col gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Issued On:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {cert.issuedAt
                          ? format(new Date(cert.issuedAt), 'MMM dd, yyyy')
                          : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Certificate ID:</span>
                      <span className="rounded border bg-gray-100 px-2 py-0.5 font-mono text-xs dark:border-gray-600 dark:bg-gray-700">
                        {cert.id.substring(0, 12)}…
                      </span>
                    </div>
                  </div>

                  {/* Action buttons row */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/certificate/${cert.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full gap-1.5 bg-amber-500 text-xs hover:bg-amber-600"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View & Download
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => handleCopyLink(cert.id)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CertificatesTab;
