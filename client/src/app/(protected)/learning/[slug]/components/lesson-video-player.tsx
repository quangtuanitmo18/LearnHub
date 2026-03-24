"use client";

import React from "react";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

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
  console.log("videoUrl", videoUrl);

  if (!videoUrl) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="relative w-full bg-gray-900 rounded-lg aspect-video">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center px-4">
              <h3 className="text-base sm:text-lg font-medium mb-2">
                No video available
              </h3>
              <p className="text-sm sm:text-base text-gray-400">
                Video URL is not provided
              </p>
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mt-4 sm:mt-6 bg-white p-4 sm:p-6 rounded-lg">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            {title}
          </h1>
          {description && (
            <div className="prose prose-sm sm:prose prose-gray max-w-none">
              <div
                className="text-sm sm:text-base text-gray-700 leading-relaxed"
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
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
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
      <div className="w-full mt-4 sm:mt-6 pb-6 sm:pb-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
          {title}
        </h1>
        {description && (
          <div className="prose prose-sm sm:prose prose-gray max-w-none">
            <div
              className="text-sm sm:text-base text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonVideoPlayer;
