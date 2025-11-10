import { useState, useEffect } from 'react';

const STORAGE_KEY_PREFIX = 'playground-guide-dismissed-';

// Check if guide image exists
const checkImageExists = async (playgroundId: string): Promise<boolean> => {
  const extensions = ['png', 'jpg', 'jpeg'];
  
  for (const ext of extensions) {
    try {
      const response = await fetch(`/extra/playground/capture/${playgroundId}.${ext}`, { method: 'HEAD' });
      if (response.ok) {
        return true;
      }
    } catch {
      // Continue to next extension
    }
  }
  
  return false;
};

export const usePlaygroundGuide = (playgroundId: string) => {
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

  // Check if image exists on mount
  useEffect(() => {
    checkImageExists(playgroundId).then(setImageExists);
  }, [playgroundId]);

  // Show modal on first visit (only if image exists)
  useEffect(() => {
    if (!hasInitialized && !isDismissed() && imageExists) {
      setIsModalOpen(true);
      setShowDontShowAgain(true);
      setHasInitialized(true);
    } else if (!hasInitialized) {
      setHasInitialized(true);
    }
  }, [hasInitialized, storageKey, imageExists]);

  // Open modal manually (from help button, only if image exists)
  const openGuide = () => {
    if (imageExists) {
      setIsModalOpen(true);
      setShowDontShowAgain(false);
    }
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
