'use client';

import React, { createContext, useContext, useRef, useCallback, useState } from 'react';

interface VideoPlayerContextType {
  /** Current playback time in seconds */
  currentTime: number;
  /** Whether the video is currently playing */
  isPlaying: boolean;
  /** Seek to a specific time in seconds */
  seekTo: (time: number) => void;
  /** Pause the video */
  pause: () => void;
  /** Resume/play the video */
  play: () => void;
  /** Register the player instance (called by VideoPlayer component) */
  registerPlayer: (player: PlayerControls) => void;
  /** Whether a video player is available */
  hasPlayer: boolean;
}

export interface PlayerControls {
  getCurrentTime: () => number;
  seekTo: (time: number) => void;
  pause: () => void;
  play: () => void;
  isPlaying: () => boolean;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);

export function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
  const playerRef = useRef<PlayerControls | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayer, setHasPlayer] = useState(false);

  const registerPlayer = useCallback((player: PlayerControls) => {
    playerRef.current = player;
    setHasPlayer(true);
  }, []);

  const seekTo = useCallback((time: number) => {
    playerRef.current?.seekTo(time);
    setCurrentTime(time);
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    playerRef.current?.play();
    setIsPlaying(true);
  }, []);

  // Called periodically by the video player to sync time
  const updateTime = useCallback((time: number, playing: boolean) => {
    setCurrentTime(time);
    setIsPlaying(playing);
  }, []);

  const value = React.useMemo(
    () => ({ currentTime, isPlaying, seekTo, pause, play, registerPlayer, hasPlayer }),
    [currentTime, isPlaying, seekTo, pause, play, registerPlayer, hasPlayer],
  );

  return (
    <VideoPlayerContext.Provider value={value}>
      <VideoPlayerSyncContext.Provider value={updateTime}>
        {children}
      </VideoPlayerSyncContext.Provider>
    </VideoPlayerContext.Provider>
  );
}

// Separate context for the sync callback to avoid unnecessary re-renders
const VideoPlayerSyncContext = createContext<
  ((time: number, playing: boolean) => void) | null
>(null);

/** Hook for components that need to read player state (Notes, etc.) */
export function useVideoPlayer() {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx) {
    return {
      currentTime: 0,
      isPlaying: false,
      seekTo: () => {},
      pause: () => {},
      play: () => {},
      registerPlayer: () => {},
      hasPlayer: false,
    };
  }
  return ctx;
}

/** Hook for the VideoPlayer component to sync its state */
export function useVideoPlayerSync() {
  return useContext(VideoPlayerSyncContext);
}
