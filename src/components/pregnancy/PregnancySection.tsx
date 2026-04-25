import { useMemo } from 'react';
import type { PregnantPatient } from '../../types/patient';
import { usePregnancies } from '../../hooks/usePregnancy';
import { useMotherChildren } from '../../hooks/useChildren';
import { usePregnancyModals } from '../../hooks/usePregnancyModals';
import { EmptyState, LoadingSpinner } from '../common/index';
import { Baby, Plus } from 'lucide-react';

import {
  OpenPregnancyModal,
} from '.';
import { CurrentPregnancyCard } from './CurrentPregnancyCard';
import { ObstetricSummary } from './ObstetricSummary';
import { PregnancyTimeline } from './PregnancyTimeline';

interface Props {
  patient: PregnantPatient;
}

/**
 * Main pregnancy section orchestrator component
 * Responsible for:
 * - Fetching pregnancy and children data
 * - Managing modal state with custom hook
 * - Delegating UI rendering to specialized sub-components
 * 
 * This cleaner architecture makes the component:
 * - More maintainable: Each sub-component has a single responsibility
 * - More testable: Can test data fetching separately from UI logic
 * - More scalable: Easy to add new features without bloating this file
 * - More secure: Clear data flow and state management
 */
export function PregnancySection({ patient }: Props) {
  const { data: pregnancies = [], isLoading } = usePregnancies(patient.id);
  const { data: children = [] } = useMotherChildren(patient.id);
  const {
    openPregnancyModal,
    setOpenPregnancyModal,
  } = usePregnancyModals();

  const activePregnancy = useMemo(
    () => pregnancies.find((p) => p.is_active) ?? null,
    [pregnancies]
  );

  const completedPregnanciesCount = useMemo(
    () => pregnancies.filter((p) => !p.is_active).length,
    [pregnancies]
  );

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!pregnancies.length) {
    return (
      <>
        <div className="bg-white border border-slate-200 rounded-2xl p-12">
          <EmptyState
            icon={<Baby className="w-8 h-8 text-slate-300" />}
            title="No pregnancy records"
            description="This patient is marked as pregnant, but no pregnancy episode exists yet."
            action={
              <button
                onClick={() => setOpenPregnancyModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Open Pregnancy
              </button>
            }
          />
        </div>

        <OpenPregnancyModal
          open={openPregnancyModal}
          onClose={() => setOpenPregnancyModal(false)}
          patientId={patient.id}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Pregnancy Overview */}
      <CurrentPregnancyCard
        patient={patient}
        pregnancy={activePregnancy}
        patientId={patient.id}
      />

      {/* Obstetric Metrics - Clean summary of patient's reproductive history */}
      <ObstetricSummary
        patient={patient}
        completedPregnanciesCount={completedPregnanciesCount}
        livingChildrenCount={children.length}
      />

      {/* Pregnancy History Timeline - Complete timeline with children records */}
      <PregnancyTimeline
        pregnancies={pregnancies}
        children={children}
        onOpenPregnancy={() => setOpenPregnancyModal(true)}
      />

      {/* Open Pregnancy Modal */}
      <OpenPregnancyModal
        open={openPregnancyModal}
        onClose={() => setOpenPregnancyModal(false)}
        patientId={patient.id}
      />
    </div>
  );
}
