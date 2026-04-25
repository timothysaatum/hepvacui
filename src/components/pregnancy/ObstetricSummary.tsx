import type { PregnantPatient } from '../types/patient';

interface Props {
  patient: PregnantPatient;
  completedPregnanciesCount: number;
  livingChildrenCount: number;
}

/**
 * Displays obstetric metrics in a compact grid
 * Reusable, focused component with clear data requirements
 */
export function ObstetricSummary({
  patient,
  completedPregnanciesCount,
  livingChildrenCount,
}: Props) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <MetricCard label="Gravida" value={patient.gravida} />
      <MetricCard label="Para" value={patient.para} />
      <MetricCard label="Completed" value={completedPregnanciesCount} />
      <MetricCard label="Living" value={livingChildrenCount} />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-slate-200 rounded-lg p-3 text-center">
      <p className="text-xs text-slate-600 font-medium">{label}</p>
      <p className="text-lg font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
