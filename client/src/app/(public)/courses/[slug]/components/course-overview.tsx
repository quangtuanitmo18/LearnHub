'use client';

import { Button } from '@/components/ui/button';
import { CourseQA, IPublicCourse } from '@/types/course';
import { formatDuration } from '@/utils/format';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
  MessageCircleQuestion,
  Target,
} from 'lucide-react';
import { useState } from 'react';

interface CourseOverviewProps {
  course: IPublicCourse;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'overview', name: 'Overview', icon: BookOpen },
  { id: 'requirements', name: 'Requirements', icon: AlertTriangle },
  { id: 'benefits', name: 'Benefits', icon: Target },
  { id: 'techniques', name: 'Techniques', icon: Lightbulb },
  { id: 'documents', name: 'Documents', icon: FileText },
  { id: 'qa', name: 'Q&A', icon: MessageCircleQuestion },
];

const CourseOverview = ({ course, activeTab, onTabChange }: CourseOverviewProps) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Check if description is too long (more than 500 characters)
  const descriptionLength = course.description?.replace(/<[^>]*>/g, '').length || 0;
  const shouldTruncate = descriptionLength > 500;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Tab Navigation */}
      <div className="scrollbar-hide overflow-x-auto border-b border-gray-200">
        <div className="flex min-w-max sm:grid sm:grid-cols-6">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center justify-center space-x-1 border-b-2 p-3 text-xs font-medium whitespace-nowrap transition-colors sm:py-4 sm:text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <IconComponent className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-xl">
                About this course
              </h3>
              <div className="relative">
                <div
                  className={`tiptap ProseMirror text-sm leading-relaxed text-gray-600 transition-all duration-300 sm:text-base ${
                    !isDescriptionExpanded && shouldTruncate ? 'max-h-60 overflow-hidden' : ''
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: course.description,
                  }}
                />
                {!isDescriptionExpanded && shouldTruncate && (
                  <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                )}
              </div>
              {shouldTruncate && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm"
                  >
                    {isDescriptionExpanded ? (
                      <>
                        Show Less
                        <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                      </>
                    ) : (
                      <>
                        Show More
                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Course Features */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base">
                This course includes:
              </h4>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                {[
                  `${formatDuration(course.totalDuration || 0)} of on-demand video`,
                  `${course.totalLessons || 0} lessons`,
                  'Full lifetime access',
                  'Access on mobile and TV',
                  'Certificate of completion',
                  '30-day money-back guarantee',
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-xs text-gray-600 sm:space-x-3 sm:text-sm"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-500 sm:h-5 sm:w-5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">
              Requirements
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {(course.info?.requirements && course.info.requirements.length > 0
                ? course.info.requirements
                : ['Basic understanding of the subject', 'Computer with internet connection']
              ).map((requirement: string, index: number) => (
                <li
                  key={index}
                  className="flex items-start space-x-2 text-xs text-gray-600 sm:space-x-3 sm:text-sm"
                >
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 sm:mt-2 sm:h-2 sm:w-2"></div>
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">
              Benefits
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {(course.info?.benefits && course.info.benefits.length > 0
                ? course.info.benefits
                : [
                    'Master the fundamentals',
                    'Build practical projects',
                    'Gain hands-on experience',
                  ]
              ).map((objective: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 rounded-lg bg-gray-50 p-3 sm:space-x-3 sm:p-4"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500 sm:h-5 sm:w-5" />
                  <span className="text-xs text-gray-700 sm:text-sm">{objective}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'techniques' && (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">
              Techniques Covered
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {(course.info?.techniques && course.info.techniques.length > 0
                ? course.info.techniques
                : ['Industry best practices', 'Modern development techniques']
              ).map((technique: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 rounded-lg border border-gray-200 p-3 transition-all hover:border-blue-300 hover:bg-blue-50 sm:space-x-3 sm:p-4"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white sm:h-6 sm:w-6 sm:text-sm">
                    {index + 1}
                  </div>
                  <span className="text-xs text-gray-700 sm:text-sm">{technique}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">
              Course Documents & Resources
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {(course.info?.documents && course.info.documents.length > 0
                ? course.info.documents
                : ['Course materials will be available after enrollment']
              ).map((document: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:shadow-md sm:space-x-3 sm:p-4"
                >
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-blue-500 sm:h-5 sm:w-5" />
                  <div className="flex-grow">
                    <p className="text-xs text-gray-700 sm:text-sm">{document}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">
              Frequently Asked Questions
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {(course.info?.qa && course.info.qa.length > 0
                ? course.info.qa
                : [
                    {
                      question: 'How long do I have access to the course?',
                      answer: 'You have lifetime access to this course.',
                    },
                  ]
              ).map((item: CourseQA, index: number) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 p-3 transition-all hover:border-blue-300 sm:p-5"
                >
                  <h4 className="mb-2 flex items-start text-sm font-semibold text-gray-900 sm:text-base">
                    <span className="mr-2 text-blue-500">Q:</span>
                    <span className="flex-1">{item.question}</span>
                  </h4>
                  <p className="ml-6 text-xs text-gray-600 sm:text-sm">
                    <span className="mr-2 font-semibold text-green-500">A:</span>
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseOverview;
