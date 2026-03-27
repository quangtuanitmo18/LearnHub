'use client';

import React from 'react';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';

interface LessonVideoPlayerProps {
  videoUrl: string;
  title: string;
  description?: string;
  onComplete?: () => void;
  isSidebarOpen?: boolean;
}

const LessonVideoPlayer = ({
  videoUrl,
  title,
  description,
  onComplete,
}: LessonVideoPlayerProps) => {
  const handleVideoEnd = () => {
    onComplete?.();
  };
  console.log('videoUrl', videoUrl);

  if (!videoUrl) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="relative aspect-video w-full rounded-lg bg-gray-900">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-4 text-center text-white">
              <h3 className="mb-2 text-base font-medium sm:text-lg">No video available</h3>
              <p className="text-sm text-gray-400 sm:text-base">Video URL is not provided</p>
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mt-4 rounded-lg bg-white p-4 sm:mt-6 sm:p-6">
          <h1 className="mb-3 text-xl font-bold text-gray-900 sm:mb-4 sm:text-2xl">{title}</h1>
          {description && (
            <div className="prose prose-sm sm:prose prose-gray max-w-none">
              <div
                className="text-sm leading-relaxed text-gray-700 sm:text-base"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Video Player */}
      <div className="w-full bg-black px-0 sm:px-4 md:px-8 lg:px-12 xl:px-16">
        <div className="aspect-video overflow-hidden rounded-lg bg-black">
          <MediaPlayer
            title={title}
            src={videoUrl}
            aspectRatio="16/9"
            crossOrigin
            onEnded={handleVideoEnd}
          >
            <MediaProvider />
            <DefaultVideoLayout icons={defaultLayoutIcons} />
          </MediaPlayer>
        </div>
      </div>

      {/* Title and Description */}
      <div className="mt-4 w-full px-4 pb-6 sm:mt-6 sm:px-6 sm:pb-8 md:px-8 lg:px-12 xl:px-16">
        <h1 className="mb-3 text-xl font-bold text-gray-900 sm:mb-4 sm:text-2xl">{title}</h1>
        {description && (
          <div className="prose prose-sm sm:prose prose-gray max-w-none">
            <div
              className="text-sm leading-relaxed text-gray-700 sm:text-base"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonVideoPlayer;
