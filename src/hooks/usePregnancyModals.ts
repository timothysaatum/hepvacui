import { useState } from 'react';
import type { Pregnancy } from '../types/pregnancy';

/**
 * Custom hook to manage all pregnancy-related modal states
 * Centralizes modal logic for better maintainability and scalability
 */
export function usePregnancyModals() {
  const [openPregnancyModal, setOpenPregnancyModal] = useState(false);
  const [closeTarget, setCloseTarget] = useState<Pregnancy | null>(null);
  const [updateTarget, setUpdateTarget] = useState<Pregnancy | null>(null);
  const [addChildTarget, setAddChildTarget] = useState<Pregnancy | null>(null);
  const [updateChildId, setUpdateChildId] = useState<string | null>(null);

  const closeAllModals = () => {
    setOpenPregnancyModal(false);
    setCloseTarget(null);
    setUpdateTarget(null);
    setAddChildTarget(null);
    setUpdateChildId(null);
  };

  return {
    openPregnancyModal,
    setOpenPregnancyModal,
    closeTarget,
    setCloseTarget,
    updateTarget,
    setUpdateTarget,
    addChildTarget,
    setAddChildTarget,
    updateChildId,
    setUpdateChildId,
    closeAllModals,
  };
}
