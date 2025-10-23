"use client";

import { useEffect, useRef, useState } from "react";
import { driver, type Driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useSession } from "@/providers/SessionProvider";
import { updateUserSource } from "@/app/actions/auth";
import posthog from "posthog-js";
import confetti from "canvas-confetti";

interface OnboardingTourProps {
  onCompleted: () => void;
}

export function OnboardingTour({ onCompleted }: OnboardingTourProps) {
  const { user } = useSession();
  const driverObj = useRef<Driver | null>(null);
  const [showSourceInput, setShowSourceInput] = useState(false);
  const tourCompletedRef = useRef(false);

  useEffect(() => {
    // Initialize driver.js
    driverObj.current = driver({
      showProgress: true,
      progressText: 'Step {{current}} of {{total}}',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Done',
      showButtons: ['next', 'previous'],
      overlayOpacity: 0.5,
      smoothScroll: true,
      allowClose: true,
      onDestroyStarted: () => {
        // Track if tour was skipped
        if (!tourCompletedRef.current) {
          posthog.capture('onboarding_tour_skipped', {
            lastStep: driverObj.current?.getActiveIndex(),
          });
          if (user?.id) {
            localStorage.setItem(`tour-dismissed-${user.id}`, 'true');
          }
        }
        driverObj.current?.destroy();
      },
      onDestroyed: () => {
        // Always show source form after tour (completed or skipped)
        setShowSourceInput(true);
      },
      onNextClick: () => {
        const currentIndex = driverObj.current?.getActiveIndex() ?? 0;
        // Check if this is the last step (now 5 steps total, so index 4 is the last)
        if (currentIndex === 4) {
          tourCompletedRef.current = true;
        }
        driverObj.current?.moveNext();
      },
      steps: [
        {
          element: 'body',
          popover: {
            title: '👋 Welcome to Waterloo App!',
            description: 'Let\'s take a quick tour to help you get started. You\'ll discover how to find jobs, save opportunities, and stay organized.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '[data-tour="sidebar"]',
          popover: {
            title: 'Navigate with ease',
            description: 'Use the sidebar to explore different sections: Browse jobs, search with filters, view your saved jobs, and access your profile.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '[data-tour="job-search"]',
          popover: {
            title: 'Find your next opportunity',
            description: 'Search and filter jobs by location, type, remote options, and more. We curate opportunities specifically for Waterloo talent.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '[data-tour="bookmarks"]',
          popover: {
            title: 'Save interesting jobs',
            description: 'Bookmark jobs you want to review later. Access all your saved opportunities from the Saved section anytime.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: 'body',
          popover: {
            title: '💬 Join our Discord community',
            description: 'Connect with other Waterloo students and alumni! Share experiences, get job advice, and stay updated. <a href="https://discord.gg/nZnqjzrp" target="_blank" rel="noopener noreferrer" style="color: #5865F2; text-decoration: underline;">Join Discord →</a>',
            side: 'top',
            align: 'center',
          },
        },
      ],
    });

    // Start tour after a short delay
    const timer = setTimeout(() => {
      posthog.capture('onboarding_tour_started');
      driverObj.current?.drive();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (driverObj.current) {
        driverObj.current.destroy();
      }
    };
  }, [user]);

  // Inline source collection form (part of the page, not a modal)
  if (showSourceInput) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/60 backdrop-blur-sm">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl">
          <h2 className="font-header text-3xl font-medium mb-3 text-foreground">
            One more thing...
          </h2>
          <p className="text-base text-muted-foreground mb-6">
            How did you hear about us?
          </p>

          <SourceCollectionForm onCompleted={onCompleted} />
        </div>
      </div>
    );
  }

  return null;
}

function SourceCollectionForm({ onCompleted }: { onCompleted: () => void }) {
  const [source, setSource] = useState("");
  const [customSource, setCustomSource] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fireConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const submitSource = async (finalSource: string) => {
    setIsSubmitting(true);
    setError(null);

    posthog.capture('source_submitted', { source: finalSource });
    const result = await updateUserSource(finalSource);

    if (result.success) {
      posthog.capture('onboarding_tour_completed');

      // Celebrate with confetti! 🎉
      fireConfetti();

      // Delay navigation slightly so user sees confetti
      setTimeout(() => {
        onCompleted();
      }, 800);
    } else {
      setError("Failed to save. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Auto-submit when dropdown changes (unless "other" is selected)
  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSource(selectedValue);

    // If not "other" and not empty, auto-submit
    if (selectedValue && selectedValue !== "other") {
      submitSource(selectedValue);
    }
  };

  // Submit custom source when form is submitted
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customSource.trim()) {
      submitSource(customSource);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="source" className="block text-sm font-medium text-muted-foreground mb-2">
          Select an option
        </label>
        <select
          id="source"
          value={source}
          onChange={handleSourceChange}
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition-all disabled:opacity-50"
          required
        >
          <option value="">Choose...</option>
          <option value="friend">Friend or colleague</option>
          <option value="reddit">Reddit</option>
          <option value="twitter">Twitter/X</option>
          <option value="linkedin">LinkedIn</option>
          <option value="facebook">Facebook</option>
          <option value="search">Search engine</option>
          <option value="university">University/School</option>
          <option value="other">Other</option>
        </select>
      </div>

      {source === "other" && (
        <>
          <div>
            <label htmlFor="customSource" className="block text-sm font-medium text-muted-foreground mb-2">
              Please specify
            </label>
            <textarea
              id="customSource"
              value={customSource}
              onChange={(e) => setCustomSource(e.target.value)}
              placeholder="Tell us how you found us..."
              className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground min-h-[80px] resize-none transition-all"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !customSource.trim()}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        </>
      )}

      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}
    </form>
  );
}
