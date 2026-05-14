import { useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { Baby, CalendarCheck2, Edit2, FilePlus2, FlaskConical, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { AddChildPanel } from './AddChildPanel';
import { EditChildPanel } from './EditChildPanel';
import { useMotherChildren } from '../../hooks/useChildren';
import type { Child } from '../../types/child';
import { getChildDisplayName, isCheckupOverdue } from '../../types/child';
import type { PregnantPatient } from '../../types/patient';

function formatDate(iso?: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatValue(value?: string | null) {
  if (!value) return '-';
  return value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function calculateAge(dob: string) {
  const birth = new Date(dob);
  const now = new Date();
  if (Number.isNaN(birth.getTime())) return '-';

  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  if (months < 1) return 'Under 1 month';
  if (months < 24) return `${months} month${months === 1 ? '' : 's'}`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'}`;
}

export function ChildManagementSection({ patient }: { patient: PregnantPatient }) {
  const { data: childrenRaw, isLoading, isError } = useMotherChildren(patient.id);
  const children = useMemo(() => Array.isArray(childrenRaw) ? childrenRaw : [], [childrenRaw]);
  const [addOpen, setAddOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  const activePregnancyId = patient.active_pregnancy?.id ?? null;
  const overdueCount = children.filter(isCheckupOverdue).length;
  const completedCheckups = children.filter(child => child.six_month_checkup_completed).length;
  const testedCount = children.filter(child => child.hep_b_antibody_test_result).length;
  const canAddChild = Boolean(activePregnancyId);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <ChildMetric label="Children" value={String(children.length)} icon={Baby} />
        <ChildMetric label="6-Month Checks" value={`${completedCheckups}/${children.length || 0}`} icon={CalendarCheck2} tone="emerald" />
        <ChildMetric label="Hep B Tests" value={String(testedCount)} icon={FlaskConical} tone="sky" />
        <ChildMetric label="Overdue" value={String(overdueCount)} icon={ShieldCheck} tone={overdueCount ? 'rose' : 'slate'} />
      </div>

      <section className="border border-slate-200 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Children and Follow-Up</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Track birth details, six-month review status, and Hepatitis B antibody testing for each child.
            </p>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)} disabled={!canAddChild}>
            <Plus className="mr-1 h-4 w-4" />
            Add Child
          </Button>
        </div>

        {!canAddChild && (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
            Open or re-register an active pregnancy before adding a new child record. Existing children remain available for follow-up updates.
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3 px-5 py-6">
            {[1, 2, 3].map(item => (
              <div key={item} className="h-20 animate-pulse border border-slate-100 bg-slate-50" />
            ))}
          </div>
        ) : isError ? (
          <div className="px-5 py-12 text-center">
            <Baby className="mx-auto h-8 w-8 text-rose-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Unable to load children</p>
            <p className="mt-1 text-xs text-slate-400">Please refresh or try again after checking your connection.</p>
          </div>
        ) : children.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Baby className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">No children recorded</p>
            <p className="mt-1 text-xs text-slate-400">Add a child after delivery to schedule the six-month follow-up automatically.</p>
            {canAddChild && (
              <Button size="sm" className="mt-4" onClick={() => setAddOpen(true)}>
                <FilePlus2 className="mr-1 h-4 w-4" />
                Add Child
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                  <th className="px-4 py-3">Child</th>
                  <th className="px-4 py-3">Birth</th>
                  <th className="px-4 py-3">6-Month Follow-Up</th>
                  <th className="px-4 py-3">Hep B Antibody</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {children.map(child => (
                  <ChildRow
                    key={child.id}
                    child={child}
                    onEdit={() => setEditingChild(child)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {addOpen && (
        <AddChildPanel
          pregnancyId={activePregnancyId}
          patientId={patient.id}
          onClose={() => setAddOpen(false)}
        />
      )}

      {editingChild && (
        <EditChildPanel
          child={editingChild}
          pregnancyId={editingChild.pregnancy_id}
          patientId={patient.id}
          onClose={() => setEditingChild(null)}
        />
      )}
    </div>
  );
}

function ChildRow({ child, onEdit }: { child: Child; onEdit: () => void }) {
  const overdue = isCheckupOverdue(child);
  const checkupTone = child.six_month_checkup_completed
    ? 'bg-emerald-100 text-emerald-700'
    : overdue
      ? 'bg-rose-100 text-rose-700'
      : 'bg-amber-100 text-amber-700';
  const checkupLabel = child.six_month_checkup_completed ? 'Completed' : overdue ? 'Overdue' : 'Pending';

  return (
    <tr className="bg-white align-top hover:bg-slate-50">
      <td className="px-4 py-4">
        <p className="font-semibold text-slate-900">{getChildDisplayName(child)}</p>
        <p className="mt-0.5 text-xs text-slate-500">{formatValue(child.sex)} · {calculateAge(child.date_of_birth)}</p>
      </td>
      <td className="px-4 py-4 text-slate-700">
        <p>{formatDate(child.date_of_birth)}</p>
        <p className="mt-0.5 text-xs text-slate-400">Pregnancy record linked</p>
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold uppercase ${checkupTone}`}>
          {checkupLabel}
        </span>
        <p className="mt-1 text-xs text-slate-500">Due {formatDate(child.six_month_checkup_date)}</p>
      </td>
      <td className="px-4 py-4">
        <p className="font-medium text-slate-800">{formatValue(child.hep_b_antibody_test_result)}</p>
        <p className="mt-0.5 text-xs text-slate-500">Tested {formatDate(child.test_date)}</p>
      </td>
      <td className="max-w-[220px] px-4 py-4">
        <p className="line-clamp-3 whitespace-pre-wrap text-slate-600">{child.notes || '-'}</p>
      </td>
      <td className="px-4 py-4 text-right">
        <Button size="sm" variant="outline" onClick={onEdit}>
          <Edit2 className="mr-1 h-3.5 w-3.5" />
          Edit
        </Button>
      </td>
    </tr>
  );
}

function ChildMetric({
  label,
  value,
  icon: Icon,
  tone = 'slate',
}: {
  label: string;
  value: string;
  icon: ElementType;
  tone?: 'slate' | 'emerald' | 'sky' | 'rose';
}) {
  const colors = {
    slate: 'border-slate-200 bg-white text-slate-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
  };

  return (
    <div className={`flex items-center justify-between border px-4 py-3 ${colors[tone]}`}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </div>
      <Icon className="h-5 w-5 opacity-70" />
    </div>
  );
}
