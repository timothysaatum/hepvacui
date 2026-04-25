import type { PregnantPatient } from '../../types/patient';
import type { Pregnancy } from '../../types/pregnancy';
import { formatDate } from '../../utils/formatters';
import {
  Building2,
  Calendar,
  Edit2,
  Baby,
  XCircle,
  UserRound,
} from 'lucide-react';

interface Props {
  patient: PregnantPatient;
  pregnancy: Pregnancy | null;
  patientId: string;
}

/**
 * Displays the current active pregnancy with key metrics
 * Shows EDD, gestational age, LMP, and first ANC visit
 * Provides action buttons for editing, closing, or adding children
 */
export function CurrentPregnancyCard({
  patient,
  pregnancy,
}: Props) {
  if (!pregnancy) {
    return null;
  }

  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3 mb-7">
          <h2 className="text-lg font-semibold text-slate-900">Current Pregnancy</h2>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
            Pregnancy #{pregnancy.pregnancy_number}
          </span>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
            Ongoing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t border-slate-200 pt-6">
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">EDD</p>
            <p className="text-sm font-semibold text-slate-900">
              {formatDate(pregnancy.expected_delivery_date)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {daysToEdd(pregnancy.expected_delivery_date)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Gestational Age</p>
            <p className="text-sm font-semibold text-slate-900">
              {formatGestation(pregnancy.gestational_age_weeks)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Current pregnancy age</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">LMP</p>
            <p className="text-sm font-semibold text-slate-900">
              {formatDate(pregnancy.lmp_date)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Last menstrual period</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">First ANC Visit</p>
            <p className="text-sm font-semibold text-slate-900">
              {formatDate(patient.created_at)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Registration date</p>
          </div>
        </div>

        <div className="mt-7 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <InfoLine
            icon={Building2}
            label="Facility"
            value={patient.facility?.name ?? '—'}
          />
          <InfoLine
            icon={Calendar}
            label="Registered On"
            value={formatDate(patient.created_at)}
          />
          <InfoLine
            icon={UserRound}
            label="Registered By"
            value={patient.created_by?.name ?? '—'}
          />
        </div>

        <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            disabled
            className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>

          <button
            disabled
            className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Close
          </button>

          <button
            disabled
            className="px-4 py-2 text-sm font-medium bg-slate-800 text-white border border-slate-800 rounded-lg hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
          >
            <Baby className="w-4 h-4" />
            Add Child
          </button>
        </div>
      </div>
    </section>
  );
}

function InfoLine({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="text-slate-500">{label}:</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}

function formatGestation(weeks?: number | null) {
  if (weeks == null) return '—';
  return `${weeks} weeks`;
}

function daysToEdd(value?: string | null) {
  if (!value) return null;

  const edd = new Date(value);
  if (Number.isNaN(edd.getTime())) return null;

  const today = new Date();
  const days = Math.ceil((edd.getTime() - today.getTime()) / 86_400_000);

  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Due today';
  return `${days} days to EDD`;
}
