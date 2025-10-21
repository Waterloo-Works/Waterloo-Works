"use client";

import { useEffect, useRef } from "react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useSession } from "@/providers/SessionProvider";
import posthog from "posthog-js";

interface JobSearchOnboardingTourProps {
  onCompleted: () => void;
}

export function JobSearchOnboardingTour({ onCompleted }: JobSearchOnboardingTourProps) {
  const { user } = useSession();
  const driverObj = useRef<Driver | null>(null);
  const tourCompletedRef = useRef(false);
  const completedCallbackCalledRef = useRef(false);

  const handleCompletion = (wasSkipped: boolean) => {
    // Prevent multiple calls
    if (completedCallbackCalledRef.current) return;
    completedCallbackCalledRef.current = true;

    // Save to localStorage immediately
    if (user?.id) {
      const tourKey = `job-search-tour-dismissed-${user.id}`;
      localStorage.setItem(tourKey, 'true');

      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('[JobSearch Onboarding] Tour completed/skipped', {
          wasSkipped,
          tourKey,
          saved: localStorage.getItem(tourKey),
        });
      }
    }

    // Call parent callback
    onCompleted();
  };

  useEffect(() => {
    // Initialize driver.js for job search page
    driverObj.current = driver({
      showProgress: true,
      progressText: 'Step {{current}} of {{total}}',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Got it!',
      showButtons: ['next', 'previous'],
      overlayOpacity: 0.5,
      smoothScroll: true,
      allowClose: true,
      onDestroyStarted: () => {
        // Track if tour was skipped
        if (!tourCompletedRef.current) {
          posthog.capture('job_search_tour_skipped', {
            lastStep: driverObj.current?.getActiveIndex(),
          });
        }
        driverObj.current?.destroy();
      },
      onDestroyed: () => {
        // Always mark as complete when destroyed (skipped or completed)
        handleCompletion(!tourCompletedRef.current);
      },
      onNextClick: () => {
        const currentIndex = driverObj.current?.getActiveIndex() ?? 0;
        // Check if this is the last step (0-indexed, 5 steps total)
        if (currentIndex === 4) {
          tourCompletedRef.current = true;
          posthog.capture('job_search_tour_completed');
        }
        driverObj.current?.moveNext();
      },
      steps: [
        {
          element: 'body',
          popover: {
            title: '🔍 Welcome to Job Search!',
            description: 'Discover powerful tools to find your perfect role. Let\'s show you what makes our job search special.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '[data-tour="search-input"]',
          popover: {
            title: 'Smart search',
            description: 'Search across job titles, companies, locations, and descriptions. Our fuzzy search finds relevant matches even with partial keywords.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '[data-tour="filters"]',
          popover: {
            title: 'Filter by your preferences',
            description: 'Narrow down results by location, job type (internship, full-time, contract), and remote options. Mix and match to find exactly what you need.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '[data-tour="bookmark-button"]',
          popover: {
            title: 'Save jobs you like',
            description: 'Bookmark interesting opportunities to review later. Access all your saved jobs from the Saved section in the sidebar.',
            side: 'left',
            align: 'start',
          },
        },
        {
          element: '[data-tour="apply-button"]',
          popover: {
            title: '🚀 Mass apply coming soon!',
            description: 'Soon you\'ll be able to apply to multiple jobs with one click. We\'re building tools to make your job search faster and easier.',
            side: 'top',
            align: 'center',
          },
        },
      ],
    });

    // Start tour after a short delay
    const timer = setTimeout(() => {
      posthog.capture('job_search_tour_started');
      driverObj.current?.drive();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (driverObj.current) {
        driverObj.current.destroy();
      }
    };
  }, [user, onCompleted]);

  return null;
}
