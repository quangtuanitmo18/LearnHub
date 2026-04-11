'use client';

import { useEffect, useRef } from 'react';
import { MediaPlayer, MediaProvider, type MediaPlayerInstance } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/layouts/video.css';
import '@vidstack/react/player/styles/default/theme.css';

import { useVideoPlayer, useVideoPlayerSync } from '../context/video-player-context';

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
  const playerRef = useRef<MediaPlayerInstance>(null);
  const { registerPlayer } = useVideoPlayer();
  const syncTime = useVideoPlayerSync();

  // Register the player controls with the shared context
  useEffect(() => {
    registerPlayer({
      getCurrentTime: () => playerRef.current?.currentTime ?? 0,
      seekTo: (time: number) => {
        if (playerRef.current) {
          playerRef.current.currentTime = time;
        }
      },
      pause: () => playerRef.current?.pause(),
      play: () => playerRef.current?.play(),
      isPlaying: () => (playerRef.current ? !playerRef.current.paused : false),
    });
  }, [registerPlayer]);

  // Sync current time to context every 500ms
  useEffect(() => {
    if (!syncTime) return;
    const interval = setInterval(() => {
      if (playerRef.current) {
        syncTime(
          playerRef.current.currentTime,
          !playerRef.current.paused,
        );
      }
    }, 500);
    return () => clearInterval(interval);
  }, [syncTime]);

  const handleVideoEnd = () => {
    onComplete?.();
  };

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
                className="tiptap ProseMirror text-sm leading-relaxed text-gray-700 sm:text-base"
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
            ref={playerRef}
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
              className="tiptap ProseMirror text-sm leading-relaxed text-gray-700 sm:text-base"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonVideoPlayer;
