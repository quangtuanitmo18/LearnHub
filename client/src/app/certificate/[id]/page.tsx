'use client';

import React, { useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useVerifyCertificate } from '@/hooks/use-certificate';
import { format } from 'date-fns';
import { Award, CheckCircle2, Copy, Download, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000';

function getImageUrl(image?: { cdnBaseUrl: string; storageKey: string } | null) {
  if (!image) return null;
  return `${image.cdnBaseUrl}/${image.storageKey}`;
}

export default function CertificateVerifyPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: cert, isLoading, isError } = useVerifyCertificate(id);

  const handleDownload = useCallback(() => {
    if (cert?.pdfUrl) {
      // Direct S3 PDF download
      const a = document.createElement('a');
      a.href = cert.pdfUrl;
      a.download = `certificate-${id}.pdf`;
      a.target = '_blank';
      a.click();
    } else {
      // Fallback: browser print dialog
      window.print();
    }
  }, [cert?.pdfUrl, id]);

  const handleCopyLink = useCallback(() => {
    const url = `${SITE_URL}/certificate/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Verification link copied!');
    });
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-100">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (isError || !cert) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <XCircle className="h-16 w-16 text-red-400" />
        <h1 className="text-2xl font-bold text-gray-800">Certificate Not Found</h1>
        <p className="max-w-md text-center text-gray-500">
          This certificate ID is invalid or does not exist. Please verify the link and try again.
        </p>
      </div>
    );
  }

  const thumbnailUrl = getImageUrl(cert.course?.image);
  const issuedDate = cert.issuedAt ? format(new Date(cert.issuedAt), 'MMMM dd, yyyy') : 'Unknown';

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .certificate-card {
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 px-4 py-10 print:bg-white print:p-0">
        {/* Top action bar */}
        <div className="no-print mx-auto mb-6 flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>This certificate is authentic and verified by LearnHub</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              className="gap-1.5 bg-amber-500 text-white hover:bg-amber-600"
            >
              <Download className="h-4 w-4" />
              {cert.pdfUrl ? 'Download PDF' : 'Save as PDF (Print)'}
            </Button>
          </div>
        </div>

        {/* Certificate Card */}
        <div
          className="certificate-card mx-auto max-w-3xl overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-2xl"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {/* Gold header bar */}
          <div className="h-3 w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

          <div className="px-12 py-10">
            {/* Logo & brand */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-8 w-8 text-amber-500" />
                <span className="text-xl font-bold tracking-wide text-gray-800">LearnHub</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Verification ID</p>
                <p className="font-mono text-xs font-semibold text-gray-600">{cert.id}</p>
              </div>
            </div>

            {/* Title */}
            <div className="mb-6 text-center">
              <p className="mb-1 text-xs font-semibold tracking-[0.3em] text-amber-600 uppercase">
                Certificate of Completion
              </p>
              <h1 className="text-4xl font-bold text-gray-900">This certifies that</h1>
            </div>

            {/* Learner name */}
            <div className="relative mb-6 py-4 text-center">
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
              <span className="relative z-10 bg-white px-6 text-4xl font-bold text-amber-700 italic">
                {cert.user?.username || 'Learner'}
              </span>
            </div>

            {/* Body text */}
            <div className="mb-8 text-center">
              <p className="text-lg text-gray-600">has successfully completed the course</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">{cert.course?.title}</h2>
              {cert.course?.author?.username && (
                <p className="mt-1 text-sm text-gray-500">
                  Taught by{' '}
                  <span className="font-semibold text-gray-700">{cert.course.author.username}</span>
                </p>
              )}
            </div>

            {/* Thumbnail (if exists) */}
            {thumbnailUrl && (
              <div className="mb-8 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl}
                  alt={cert.course?.title}
                  className="h-24 w-40 rounded-lg object-cover opacity-80 shadow"
                />
              </div>
            )}

            {/* Footer row */}
            <div className="flex items-end justify-between border-t border-amber-100 pt-8">
              <div>
                <div className="h-px w-32 bg-gray-400" />
                <p className="mt-1 text-xs text-gray-500">Date Issued</p>
                <p className="text-sm font-semibold text-gray-800">{issuedDate}</p>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <div>
                  <p className="text-sm font-bold text-green-700">Verified by LearnHub</p>
                  <p className="text-xs text-gray-500">
                    {SITE_URL}/certificate/{cert.id}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="h-px w-32 bg-gray-400" />
                <p className="mt-1 text-xs text-gray-500">Authorized Signature</p>
                <p className="text-sm font-semibold text-gray-800">LearnHub Team</p>
              </div>
            </div>
          </div>

          {/* Gold footer bar */}
          <div className="h-3 w-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400" />
        </div>

        {/* Bottom trust badge */}
        <div className="no-print mx-auto mt-6 max-w-3xl rounded-xl border border-green-200 bg-green-50 px-6 py-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-800">Certificate Verified ✓</p>
              <p className="mt-0.5 text-xs text-green-600">
                This certificate was issued by LearnHub to <strong>{cert.user?.username}</strong> on{' '}
                {issuedDate} upon completing <strong>{cert.course?.title}</strong>. Certificate ID:{' '}
                <code className="rounded bg-green-100 px-1">{cert.id}</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
