import { useEffect, useState } from 'react';

const STORAGE_KEY = 'drive4health.activeFacilityId';
const EVENT_NAME = 'drive4health:active-facility';

function readStoredFacilityId() {
  return window.localStorage.getItem(STORAGE_KEY) || '';
}

export function setStoredActiveFacilityId(facilityId: string) {
  if (facilityId) {
    window.localStorage.setItem(STORAGE_KEY, facilityId);
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: facilityId }));
}

export function useActiveFacility() {
  const [activeFacilityId, setActiveFacilityId] = useState(() => readStoredFacilityId());

  useEffect(() => {
    const sync = () => setActiveFacilityId(readStoredFacilityId());
    const syncCustom = (event: Event) => {
      setActiveFacilityId((event as CustomEvent<string>).detail || readStoredFacilityId());
    };

    window.addEventListener('storage', sync);
    window.addEventListener(EVENT_NAME, syncCustom);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(EVENT_NAME, syncCustom);
    };
  }, []);

  return { activeFacilityId, setActiveFacilityId: setStoredActiveFacilityId };
}
