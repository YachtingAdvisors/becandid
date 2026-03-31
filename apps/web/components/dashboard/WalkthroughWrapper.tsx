'use client';

import { useState, useCallback } from 'react';
import WelcomeModal from './WelcomeModal';
import GettingStartedCard from './GettingStartedCard';

interface WalkthroughWrapperProps {
  userName: string;
  completedSteps: Record<string, boolean>;
}

export default function WalkthroughWrapper({ userName, completedSteps }: WalkthroughWrapperProps) {
  const [showChecklist, setShowChecklist] = useState(true);
  const [showModal, setShowModal] = useState(true);

  const dismissWalkthrough = useCallback(() => {
    fetch('/api/walkthrough', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dismiss: true }),
    }).catch(() => {});
  }, []);

  const handleGetStarted = useCallback(() => {
    setShowModal(false);
    // Keep checklist visible
  }, []);

  const handleDismissAll = useCallback(() => {
    setShowModal(false);
    setShowChecklist(false);
    dismissWalkthrough();
  }, [dismissWalkthrough]);

  const handleDismissChecklist = useCallback(() => {
    setShowChecklist(false);
    dismissWalkthrough();
  }, [dismissWalkthrough]);

  return (
    <>
      {showModal && (
        <WelcomeModal
          userName={userName}
          onGetStarted={handleGetStarted}
          onDismiss={handleDismissAll}
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
