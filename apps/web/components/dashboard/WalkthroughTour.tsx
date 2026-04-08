'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface WalkthroughTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string | null; // null = centered, no spotlight
  icon: string;
}

const STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Be Candid!',
    description: "Let's take a quick tour to help you get the most out of your accountability dashboard.",
    targetSelector: null,
    icon: 'waving_hand',
  },
  {
    id: 'focus-board',
    title: 'Focus Board',
    description: 'This is your Focus Board. It shows your daily focus status — morning and evening.',
    targetSelector: '[data-tour="focus-board"]',
    icon: 'center_focus_strong',
  },
  {
    id: 'journal',
    title: 'Candid Journal',
    description: 'Your Candid Journal is where you process what\'s happening beneath the surface.',
    targetSelector: '[data-tour="journal"]',
    icon: 'edit_note',
  },
  {
    id: 'checkins',
    title: 'Check-ins',
    description: 'Regular check-ins keep you and your partner connected.',
    targetSelector: '[data-tour="checkins"]',
    icon: 'check_circle',
  },
  {
    id: 'coach',
    title: 'Conversation Coach',
    description: 'When things get hard, your Conversation Coach walks you through understanding what happened.',
    targetSelector: null,
    icon: 'forum',
  },
  {
    id: 'partner',
    title: 'Accountability Partner',
    description: 'Your accountability partner sees your focus status — never your browsing history.',
    targetSelector: '[data-tour="partner"]',
    icon: 'handshake',
  },
  {
    id: 'customize',
    title: 'Personalize Your Dashboard',
    description: 'Add, remove, or reorder widgets to build the dashboard that works for you. Click Customize anytime to change your layout.',
    targetSelector: '[data-tour="customize"]',
    icon: 'dashboard_customize',
  },
  {
    id: 'complete',
    title: "You're ready!",
    description: "Remember: this isn't about perfection. It's about honesty.",
    targetSelector: null,
    icon: 'check_circle',
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function WalkthroughTour({ onComplete, onSkip }: WalkthroughTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'below' | 'above'>('below');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  // Measure target element position
  const measureTarget = useCallback(() => {
    if (!step.targetSelector) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(step.targetSelector);
    if (!el) {
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 8;
    setTargetRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Determine tooltip position: below if enough room, above otherwise
    const spaceBelow = window.innerHeight - rect.bottom;
    setTooltipPosition(spaceBelow > 280 ? 'below' : 'above');
  }, [step.targetSelector]);

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Measure on step change and on resize/scroll
  useEffect(() => {
    measureTarget();
    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, true);
    return () => {
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget, true);
    };
  }, [measureTarget]);

  const goToStep = useCallback((nextIdx: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(nextIdx);
      setIsTransitioning(false);
    }, 200);
  }, []);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      // Complete: dismiss walkthrough
      fetch('/api/walkthrough', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismiss: true }),
      }).catch(() => {});
      onComplete();
    } else {
      goToStep(currentStep + 1);
    }
  }, [isLastStep, currentStep, goToStep, onComplete]);

  const handleSkip = useCallback(() => {
    fetch('/api/walkthrough', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dismiss: true }),
    }).catch(() => {});
    onSkip();
  }, [onSkip]);

  // Build the box-shadow spotlight effect
  // A massive box-shadow covers the entire screen, with the element itself being the "hole"
  const spotlightStyle = targetRect
    ? {
        position: 'fixed' as const,
        top: targetRect.top,
        left: targetRect.left,
        width: targetRect.width,
        height: targetRect.height,
        borderRadius: '16px',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
        pointerEvents: 'none' as const,
        zIndex: 60,
        transition: 'all 0.3s ease-in-out',
      }
    : null;

  // Tooltip positioning
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect || !step.targetSelector) {
      // Centered on screen
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 70,
      };
    }

    const tooltipWidth = 340;
    let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    // Keep within viewport
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

    if (tooltipPosition === 'below') {
      return {
        position: 'fixed',
        top: targetRect.top + targetRect.height + 16,
        left,
        width: tooltipWidth,
        zIndex: 70,
      };
    } else {
      return {
        position: 'fixed',
        bottom: window.innerHeight - targetRect.top + 16,
        left,
        width: tooltipWidth,
        zIndex: 70,
      };
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Dark overlay (only when no spotlight target) */}
      {!targetRect && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      )}

      {/* Spotlight hole via box-shadow */}
      {spotlightStyle && <div style={spotlightStyle} />}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        style={getTooltipStyle()}
        className={`transition-all duration-300 ${
          isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl p-6 max-w-[340px]">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4 mx-auto">
            <span
              className="material-symbols-outlined text-primary text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {step.icon}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-headline text-lg font-bold text-on-surface text-center mb-2">
            {step.title}
          </h3>

          {/* Description */}
          <p className="font-body text-sm text-on-surface-variant text-center leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'w-6 h-2 bg-primary'
                    : i < currentStep
                    ? 'w-2 h-2 bg-primary/40'
                    : 'w-2 h-2 bg-on-surface-variant/20'
                }`}
              />
            ))}
          </div>

          {/* Step counter */}
          <p className="text-[10px] font-label text-on-surface-variant/60 text-center mb-4">
            {currentStep + 1} of {STEPS.length}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-xs font-label font-medium text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors"
            >
              Skip tour
            </button>

            <div className="flex gap-2">
              {!isFirstStep && (
                <button
                  onClick={() => goToStep(currentStep - 1)}
                  className="px-4 py-2 text-sm font-label font-semibold text-primary bg-primary/[0.06] rounded-full hover:bg-primary/[0.12] cursor-pointer transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-5 py-2 text-sm font-label font-bold text-on-primary bg-primary rounded-full hover:opacity-90 cursor-pointer transition-opacity"
              >
                {isLastStep ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
