import { useState, useEffect } from 'react';

const STORAGE_KEY_PREFIX = 'playground-guide-dismissed-';

export const usePlaygroundGuide = (playgroundId: string) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDontShowAgain, setShowDontShowAgain] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const storageKey = `${STORAGE_KEY_PREFIX}${playgroundId}`;

  // Check if user has dismissed the guide before
  const isDismissed = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(storageKey) === 'true';
  };

  // Show modal on first visit
  useEffect(() => {
    if (!hasInitialized && !isDismissed()) {
      setIsModalOpen(true);
      setShowDontShowAgain(true);
      setHasInitialized(true);
    } else {
      setHasInitialized(true);
    }
  }, [hasInitialized, storageKey]);

  // Open modal manually (from help button)
  const openGuide = () => {
    setIsModalOpen(true);
    setShowDontShowAgain(false);
  };

  // Close modal
  const closeGuide = () => {
    setIsModalOpen(false);
  };

  // Handle "don't show again" checkbox
  const handleDontShowAgain = (checked: boolean) => {
    if (checked && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
  };

  return {
    isModalOpen,
    showDontShowAgain,
    openGuide,
    closeGuide,
    handleDontShowAgain,
  };
};
