import { useState, useEffect } from 'react';

const STORAGE_KEY_PREFIX = 'playground-guide-dismissed-';

// Check if guide image exists (png only)
const checkImageExists = async (playgroundId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/extra/playground/capture/${playgroundId}.png`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

export const usePlaygroundGuide = (playgroundId: string, isActiveTab: boolean) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDontShowAgain, setShowDontShowAgain] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [imageExists, setImageExists] = useState(false);

  const storageKey = `${STORAGE_KEY_PREFIX}${playgroundId}`;

  // Check if user has dismissed the guide before
  const isDismissed = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(storageKey) === 'true';
  };

  // Check if image exists only when tab becomes active
  useEffect(() => {
    if (isActiveTab && !hasInitialized && !isDismissed()) {
      checkImageExists(playgroundId).then((exists) => {
        setImageExists(exists);
        if (exists) {
          setIsModalOpen(true);
          setShowDontShowAgain(true);
        }
        setHasInitialized(true);
      });
    } else if (!hasInitialized) {
      setHasInitialized(true);
    }
  }, [isActiveTab, hasInitialized, playgroundId, storageKey]);

  // Open modal manually (from help button)
  const openGuide = async () => {
    // Check image exists if not checked yet
    if (!imageExists) {
      const exists = await checkImageExists(playgroundId);
      setImageExists(exists);
      if (!exists) return; // Don't open if no image
    }
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
