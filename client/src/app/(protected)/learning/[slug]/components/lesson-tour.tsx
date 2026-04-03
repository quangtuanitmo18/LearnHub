'use client';

import { useCallback, useEffect, useRef } from 'react';
import { driver, type DriveStep, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_STEPS: DriveStep[] = [
  {
    popover: {
      title: '👋 Welcome to LearnHub!',
      description:
        'Let us give you a quick tour of the learning interface. You can revisit this guide anytime by clicking the Guide button.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#tour-progress',
    popover: {
      title: '📊 Your Progress',
      description:
        'Track how many lessons you have completed in this course. The circular indicator shows your overall completion percentage.',
      side: 'bottom' as const,
      align: 'end' as const,
    },
  },
  {
    element: '#tour-sidebar',
    popover: {
      title: '📚 Course Content',
      description:
        'Browse through all chapters and lessons here. Click on any lesson to jump to it, and use the checkboxes to mark lessons as completed.',
      side: 'left' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#tour-navigation',
    popover: {
      title: '⏩ Lesson Navigation',
      description:
        'Use these buttons to move between lessons. Go to the previous or next lesson, or toggle the sidebar visibility.',
      side: 'top' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#tour-comments',
    popover: {
      title: '💬 Q&A Discussion',
      description:
        'Have questions? Click here to open the discussion panel where you can ask questions, help others, and engage with the community.',
      side: 'top' as const,
      align: 'end' as const,
    },
  },
  {
    popover: {
      title: '🎉 You are all set!',
      description:
        'That is it! Start learning and enjoy the course. You can always click the Guide button in the top bar to see this tour again. Happy learning!',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
];

export function useLessonTour() {
  const driverRef = useRef<Driver | null>(null);

  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
    };
  }, []);

  const startTour = useCallback(() => {
    // Destroy previous instance if exists
    driverRef.current?.destroy();

    const driverInstance = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayColor: 'rgba(15, 23, 42, 0.75)',
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: 'learnhub-tour-popover',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Get Started! 🚀',
      progressText: '{{current}} of {{total}}',
      steps: TOUR_STEPS,
    });

    driverRef.current = driverInstance;
    driverInstance.drive();
  }, []);

  return { startTour };
}
