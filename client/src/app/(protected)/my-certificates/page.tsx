'use client';

import React from 'react';
import { useMyCertificates } from '@/hooks/use-certificate';
import { format } from 'date-fns';
import { Award, Download, ExternalLink, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function MyCertificatesPage() {
  const { data: certificates, isLoading } = useMyCertificates();

  return (
    <div className="container mx-auto px-4 py-8 mt-16 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Award className="w-8 h-8 text-amber-500" />
            My Certificates
          </h1>
          <p className="mt-2 text-gray-600">
            View and download all your earned certificates from completed courses.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex p-12 justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : !certificates || certificates.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No certificates yet</h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Complete all lessons and quizzes in a course 100% to claim your first certificate! 
            Keep learning!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-gray-100 relative group flex items-center justify-center p-6">
                {cert.course?.image ? (
                  <Image 
                    src={cert.course.image}
                    alt={`Certificate for ${cert.course?.title}`}
                    fill
                    className="object-contain opacity-20"
                  />
                ) : null}
                <div className="z-10 text-center space-y-4 w-full bg-white/90 p-4 rounded-xl border border-gray-100 shadow-sm backdrop-blur-sm">
                  <Award className="w-12 h-12 text-amber-500 mx-auto" />
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Certificate of Completion</div>
                    <div className="text-xl font-serif text-gray-900 border-b border-gray-200 pb-3">{cert.course?.title}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-700">Learner ID: {cert.userId.substring(0,8)}...</div>
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-20">
                  <a href={`/courses/${cert.course?.slug}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm" className="gap-2 w-40">
                      <ExternalLink className="w-4 h-4" /> View Course
                    </Button>
                  </a>
                  {cert.pdfUrl && cert.pdfUrl !== '' ? (
                    <a href={cert.pdfUrl} download>
                      <Button variant="default" size="sm" className="gap-2 w-40">
                        <Download className="w-4 h-4" /> Download PDF
                      </Button>
                    </a>
                  ) : (
                    <Button disabled variant="outline" size="sm" className="gap-2 w-40 text-gray-300">
                      <Download className="w-4 h-4" /> PDF processing...
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg line-clamp-1" title={cert.course?.title}>
                  {cert.course?.title}
                </h3>
                <div className="mt-4 flex flex-col gap-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Issued On:</span>
                    <span className="font-medium text-gray-900">{cert.issuedAt ? format(new Date(cert.issuedAt), 'MMMM dd, yyyy') : 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-500">Verification ID:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded border">{cert.id.substring(0,12)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
