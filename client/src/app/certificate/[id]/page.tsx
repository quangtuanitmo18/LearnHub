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
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-50 via-amber-50/40 to-orange-50/40 px-4 py-8 sm:py-12 px-4 print:bg-white print:p-0 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
        {/* Animated Background Pattern */}
        <div className="no-print absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 h-[40vh] w-[40vh] animate-pulse rounded-full bg-linear-to-br from-amber-400/20 to-orange-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[50vh] w-[50vh] animate-pulse rounded-full bg-linear-to-br from-yellow-400/20 to-amber-400/20 blur-3xl delay-1000" />
        </div>

        <div className="relative z-10">
          {/* Top action bar */}
          <div className="no-print mx-auto mb-8 flex max-w-4xl flex-col items-center justify-between gap-4 rounded-xl border border-white/50 bg-white/70 px-6 py-4 shadow-sm backdrop-blur-md sm:flex-row dark:border-gray-800/50 dark:bg-gray-900/70">
            <div className="flex items-center gap-3 text-sm text-green-700 dark:text-green-500">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="font-medium">This certificate is authentic and verified.</span>
            </div>
            <div className="flex w-full gap-3 sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="flex-1 gap-2 border-amber-200 bg-white text-amber-700 shadow-sm transition-all hover:bg-amber-50 sm:flex-none dark:border-amber-900/30 dark:bg-gray-800 dark:text-amber-400 dark:hover:bg-amber-900/20"
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transition-all hover:from-amber-600 hover:to-orange-600 sm:flex-none dark:shadow-orange-900/20"
              >
                <Download className="h-4 w-4" />
                {cert.pdfUrl ? 'Download PDF' : 'Save PDF'}
              </Button>
            </div>
          </div>

        {/* Certificate Card */}
        {/* Certificate Card */}
        <div
          className="certificate-card mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white/95 shadow-[0_0_40px_rgba(251,191,36,0.15)] ring-1 ring-amber-200/60 backdrop-blur-xl dark:bg-gray-900/95 dark:ring-amber-900/40 dark:shadow-[0_0_40px_rgba(251,191,36,0.05)]"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {/* Gold header bar */}
          <div className="h-4 w-full bg-linear-to-r from-amber-400 via-yellow-300 to-amber-500" />

          <div className="px-8 py-12 sm:px-16">
            {/* Logo & brand */}
            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
                  <Award className="h-7 w-7 text-amber-500" />
                </div>
                <span className="text-2xl font-bold tracking-wide text-gray-800 dark:text-gray-100 font-sans">LearnHub</span>
              </div>
              <div className="text-right font-sans">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Verification ID</p>
                <p className="font-mono text-xs font-semibold text-gray-600 mt-1 dark:text-gray-400 badge-id">{cert.id.substring(0, 18)}...</p>
              </div>
            </div>

            {/* Title */}
            <div className="mb-8 text-center">
              <p className="mb-2 text-xs font-bold tracking-[0.4em] text-amber-600 uppercase dark:text-amber-500 font-sans">
                Certificate of Completion
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">This certifies that</h1>
            </div>

            {/* Learner name */}
            <div className="relative mb-10 py-4 text-center">
              <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-linear-to-r from-transparent via-amber-300/70 to-transparent dark:via-amber-700/50" />
              <span className="relative z-10 px-8 text-4xl sm:text-5xl font-bold text-amber-700 dark:text-amber-500 italic drop-shadow-sm style-script">
                {cert.user?.username || 'Learner'}
              </span>
            </div>

            {/* Body text */}
            <div className="mb-12 text-center font-sans tracking-wide">
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">has successfully completed the course</p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white serif-title">{cert.course?.title}</h2>
              {cert.course?.author?.username && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Taught by{' '}
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{cert.course.author.username}</span>
                </p>
              )}
            </div>

            {/* Thumbnail (if exists) */}
            {thumbnailUrl && (
              <div className="mb-10 flex justify-center">
                <div className="relative rounded-xl bg-amber-50/50 p-2 ring-1 ring-amber-100 dark:bg-amber-900/10 dark:ring-amber-900/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailUrl}
                    alt={cert.course?.title}
                    className="h-28 w-48 rounded-lg object-cover shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Footer row */}
            <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between border-t-2 border-amber-50 border-dashed pt-8 dark:border-amber-900/30">
              <div className="text-center sm:text-left">
                <div className="mx-auto sm:mx-0 h-px w-24 bg-amber-300 dark:bg-amber-700/50 mb-2" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Date Issued</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 font-sans mt-0.5">{issuedDate}</p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-green-50 p-3 ring-1 ring-green-200 dark:bg-green-900/20 dark:ring-green-900/40">
                  <Award className="h-8 w-8 text-green-600 dark:text-green-500" />
                </div>
                <div className="text-center font-sans">
                  <p className="text-xs font-bold text-green-700 dark:text-green-500 tracking-wide">VERIFIED BY LEARNHUB</p>
                  <p className="text-[10px] text-gray-500 truncate max-w-[200px]">
                    {SITE_URL}/certificate/{cert.id.substring(0, 8)}
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="mx-auto sm:ml-auto sm:mr-0 h-px w-24 bg-amber-300 dark:bg-amber-700/50 mb-2" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Authorized Signature</p>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-500 mt-1" style={{ fontFamily: "'Brush Script MT', cursive, serif" }}>LearnHub Team</p>
              </div>
            </div>
          </div>

          {/* Gold footer bar */}
          <div className="h-4 w-full bg-linear-to-r from-amber-500 via-yellow-300 to-amber-400" />
        </div>

        {/* Bottom trust badge */}
        <div className="no-print mx-auto mt-8 max-w-3xl rounded-xl bg-white/60 p-5 shadow-sm ring-1 ring-black/5 backdrop-blur-md dark:bg-gray-900/60 dark:ring-white/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">Official Certificate Verification</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                This certificate was issued by LearnHub to <strong className="text-gray-900 dark:text-white">{cert.user?.username}</strong> on{' '}
                {issuedDate} upon completion of the course <strong className="text-gray-900 dark:text-white">{cert.course?.title}</strong>. Certificate verification ID:{' '}
                <code className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-300">{cert.id}</code>
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
