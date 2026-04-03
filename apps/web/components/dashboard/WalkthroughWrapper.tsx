'use client';

import { useState, useCallback } from 'react';
import WelcomeModal from './WelcomeModal';
import GettingStartedCard from './GettingStartedCard';
import WalkthroughTour from './WalkthroughTour';

interface WalkthroughWrapperProps {
  userName: string;
  completedSteps: Record<string, boolean>;
}

export default function WalkthroughWrapper({ userName, completedSteps }: WalkthroughWrapperProps) {
  const [showChecklist, setShowChecklist] = useState(true);
  const [showModal, setShowModal] = useState(true);
  const [showTour, setShowTour] = useState(false);

  const dismissWalkthrough = useCallback(() => {
    fetch('/api/walkthrough', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dismiss: true }),
    }).catch(() => {});
  }, []);

  const handleGetStarted = useCallback(() => {
    setShowModal(false);
    // Launch the guided tour
    setShowTour(true);
  }, []);

  const handleDismissAll = useCallback(() => {
    setShowModal(false);
    setShowChecklist(false);
    setShowTour(false);
    dismissWalkthrough();
  }, [dismissWalkthrough]);

  const handleDismissChecklist = useCallback(() => {
    setShowChecklist(false);
    dismissWalkthrough();
  }, [dismissWalkthrough]);

  const handleTourComplete = useCallback(() => {
    setShowTour(false);
    // Keep checklist visible so user can track setup progress
  }, []);

  const handleTourSkip = useCallback(() => {
    setShowTour(false);
  }, []);

  return (
    <>
      {showModal && (
        <WelcomeModal
          userName={userName}
          onGetStarted={handleGetStarted}
          onDismiss={handleDismissAll}
        />
      )}
      {showTour && (
        <WalkthroughTour
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}
      {showChecklist && (
        <GettingStartedCard
          completedSteps={completedSteps}
          onDismiss={handleDismissChecklist}
        />
      )}
    </>
  );
}
