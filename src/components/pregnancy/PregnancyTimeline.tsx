import { useMemo, useState } from 'react';
import type { Pregnancy } from '../../types/pregnancy';
import type { Child } from '../../types/child';
import { formatDate, PREGNANCY_OUTCOME_LABELS } from '../../utils/formatters';
import {
  AlertTriangle,
  Baby,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Edit2,
  Plus,
  XCircle,
} from 'lucide-react';
import {
  AddChildModal,
  ClosePregnancyModal,
  UpdateChildModal,
  UpdatePregnancyModal,
} from '.';

interface Props {
  pregnancies: Pregnancy[];
  children: Child[];
  onOpenPregnancy: () => void;
}

/**
 * Displays pregnancy history in a timeline format
 * Manages pregnancy expansion state and modal interactions
 */
export function PregnancyTimeline({
  pregnancies,
  children,
  onOpenPregnancy,
}: Props) {
  const [closeTarget, setCloseTarget] = useState<Pregnancy | null>(null);
  const [updateTarget, setUpdateTarget] = useState<Pregnancy | null>(null);
  const [addChildTarget, setAddChildTarget] = useState<Pregnancy | null>(null);
  const [updateChildId, setUpdateChildId] = useState<string | null>(null);

  const sortedPregnancies = useMemo(() => {
    return [...pregnancies].sort((a, b) => b.pregnancy_number - a.pregnancy_number);
  }, [pregnancies]);

  const completedPregnancies = sortedPregnancies.filter((p) => !p.is_active);

  const childForUpdate = children.find((c) => c.id === updateChildId) ?? null;

  const childrenByPregnancyId = useMemo(() => {
    return children.reduce<Record<string, Child[]>>((acc, child) => {
      if (!child.pregnancy_id) return acc;
      acc[child.pregnancy_id] ??= [];
      acc[child.pregnancy_id].push(child);
      return acc;
    }, {});
  }, [children]);

  const hasActivePregnancy = pregnancies.some((p) => p.is_active);

  if (!pregnancies.length) {
    return null;
  }

  return (
    <>
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Pregnancy History</h3>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full font-semibold">
              {sortedPregnancies.length}
            </span>
          </div>
          {!hasActivePregnancy && (
            <button
              onClick={onOpenPregnancy}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Open Pregnancy
            </button>
          )}
        </div>

        <div className="relative pl-7 space-y-4">
          <div className="absolute left-[10px] top-3 bottom-8 w-px border-l border-dashed border-slate-300" />

          {sortedPregnancies.map((pregnancy) => (
            <PregnancyTimelineItem
              key={pregnancy.id}
              pregnancy={pregnancy}
              children={childrenByPregnancyId[pregnancy.id] ?? []}
              onEdit={() => setUpdateTarget(pregnancy)}
              onClose={() => setCloseTarget(pregnancy)}
              onAddChild={() => setAddChildTarget(pregnancy)}
              onUpdateChild={(childId) => setUpdateChildId(childId)}
            />
          ))}

          <div className="ml-3 border border-dashed border-slate-200 rounded-2xl bg-white px-5 py-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">No more pregnancy records</p>
              <p className="text-sm text-slate-500">
                All pregnancy episodes for this patient are listed above.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {closeTarget && (
        <ClosePregnancyModal
          open
          onClose={() => setCloseTarget(null)}
          pregnancy={closeTarget}
          patientId={closeTarget.patient_id}
        />
      )}

      {updateTarget && (
        <UpdatePregnancyModal
          open
          onClose={() => setUpdateTarget(null)}
          pregnancy={updateTarget}
          patientId={updateTarget.patient_id}
        />
      )}

      {addChildTarget && (
        <AddChildModal
          open
          onClose={() => setAddChildTarget(null)}
          pregnancy={addChildTarget}
          patientId={addChildTarget.patient_id}
        />
      )}

      {childForUpdate && (
        <UpdateChildModal
          open
          onClose={() => setUpdateChildId(null)}
          child={childForUpdate}
          patientId={childForUpdate.patient_id}
        />
      )}
    </>
  );
}

function PregnancyTimelineItem({
  pregnancy,
  children,
  onEdit,
  onClose,
  onAddChild,
  onUpdateChild,
}: {
  pregnancy: Pregnancy;
  children: Child[];
  onEdit: () => void;
  onClose: () => void;
  onAddChild: () => void;
  onUpdateChild: (childId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const ongoing = pregnancy.is_active;

  return (
    <article className="relative ml-3">
      <div
        className={`absolute -left-[31px] top-6 w-6 h-6 rounded-full border-4 bg-white flex items-center justify-center ${
          ongoing ? 'border-purple-500' : 'border-teal-500'
        }`}
      >
        {ongoing ? (
          <span className="w-2 h-2 rounded-full bg-purple-500" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
        )}
      </div>

      <div
        className={`rounded-2xl border shadow-sm overflow-hidden ${
          ongoing ? 'bg-purple-50/30 border-purple-100' : 'bg-emerald-50/30 border-emerald-100'
        }`}
      >
        <button
          onClick={() => setExpanded((value) => !value)}
          className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-bold text-slate-900">
              Pregnancy #{pregnancy.pregnancy_number}
            </h3>
            {ongoing ? (
              <Badge color="purple">Ongoing</Badge>
            ) : (
              <Badge color="emerald">
                {pregnancy.outcome ? PREGNANCY_OUTCOME_LABELS[pregnancy.outcome] ?? pregnancy.outcome : 'Completed'}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {ongoing && (
              <SmallButton icon={Edit2} onClick={onEdit}>
                Edit
              </SmallButton>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {expanded && (
          <div className="px-5 pb-5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-t border-white/80 pt-4">
              <DataPoint label="LMP" value={formatDate(pregnancy.lmp_date)} />
              <DataPoint label="EDD" value={formatDate(pregnancy.expected_delivery_date)} />
              <DataPoint
                label={ongoing ? 'Gestational Age' : 'Delivery Date'}
                value={
                  ongoing
                    ? formatGestation(pregnancy.gestational_age_weeks)
                    : formatDate(pregnancy.actual_delivery_date)
                }
              />
              <DataPoint
                label="Outcome"
                value={
                  pregnancy.outcome
                    ? PREGNANCY_OUTCOME_LABELS[pregnancy.outcome] ?? pregnancy.outcome
                    : ongoing
                      ? 'Ongoing'
                      : '—'
                }
              />
              <DataPoint
                label="Risk Level"
                value={pregnancy.risk_factors ? 'Needs review' : 'Low Risk'}
                dot={!pregnancy.risk_factors}
              />
            </div>

            {pregnancy.risk_factors && (
              <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <span className="font-semibold">Risk factors:</span> {pregnancy.risk_factors}
                </span>
              </div>
            )}

            {pregnancy.notes && (
              <p className="mt-4 text-sm text-slate-500 italic">{pregnancy.notes}</p>
            )}

            {children.length > 0 && (
              <div className="mt-5 space-y-3">
                {children.map((child) => (
                  <ChildSummaryCard
                    key={child.id}
                    child={child}
                    onUpdate={() => onUpdateChild(child.id)}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {ongoing && (
                <>
                  <ActionButton
                    compact
                    variant="outline"
                    icon={Edit2}
                    onClick={onEdit}
                  >
                    Edit Pregnancy
                  </ActionButton>
                  <ActionButton
                    compact
                    variant="danger"
                    icon={XCircle}
                    onClick={onClose}
                  >
                    Close Pregnancy
                  </ActionButton>
                  <ActionButton
                    compact
                    variant="primary"
                    icon={Baby}
                    onClick={onAddChild}
                  >
                    Add Child
                  </ActionButton>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function ChildSummaryCard({ child, onUpdate }: { child: Child; onUpdate: () => void }) {
  const age = getAgeLabel(child.date_of_birth);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_auto] gap-4 items-center">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
          <Baby className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-slate-900 truncate">
            {child.name || 'Unnamed child'}
          </p>
          <p className="text-sm text-slate-500">
            {capitalize(child.sex)} · Born: {formatDate(child.date_of_birth)} · {age}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-500 mb-2">Vaccination Status</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <MiniStatus
            label="Hep B"
            value={
              child.hep_b_antibody_test_result
                ? capitalize(child.hep_b_antibody_test_result)
                : 'Not tested'
            }
          />
          <MiniStatus
            label="6-Month Vaccines"
            value={child.six_month_checkup_completed ? 'Completed' : 'Pending'}
            warning={!child.six_month_checkup_completed}
          />
          <MiniStatus
            label="Checkup Due"
            value={formatDate(child.six_month_checkup_date)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={onUpdate}
          className="px-3 py-2 rounded-lg border border-teal-200 text-teal-700 text-sm font-semibold hover:bg-teal-50 transition-colors"
        >
          Edit Child
        </button>
      </div>
    </div>
  );
}

// Helper Components & Functions

function ActionButton({
  children,
  icon: Icon,
  variant,
  compact = false,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ElementType;
  variant: 'primary' | 'outline' | 'danger';
  compact?: boolean;
  onClick: () => void;
}) {
  const styles = {
    primary: 'bg-slate-800 text-white border-slate-800 hover:bg-slate-900',
    outline: 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50',
    danger: 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${compact ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-sm'} inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors ${styles[variant]}`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function SmallButton({
  children,
  icon: Icon,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50"
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function DataPoint({
  label,
  value,
  dot = false,
}: {
  label: string;
  value: string;
  dot?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
        {dot && <span className="w-2 h-2 rounded-full bg-teal-500" />}
        {value}
      </p>
    </div>
  );
}

function MiniStatus({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="border border-slate-200 rounded-lg px-3 py-2 bg-white">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className={`text-sm font-medium mt-1 ${warning ? 'text-orange-600' : 'text-slate-700'}`}>
        {value}
      </p>
    </div>
  );
}

function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: 'purple' | 'emerald' | 'blue' | 'orange';
}) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
      {children}
    </span>
  );
}

function formatGestation(weeks?: number | null) {
  if (weeks == null) return '—';
  return `${weeks} weeks`;
}

function getAgeLabel(value?: string | null) {
  if (!value) return '—';

  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return '—';

  const months = Math.max(
    0,
    Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
  );

  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}yr ${months % 12}mo`;
}

function capitalize(value?: string | null) {
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll('_', ' ');
}
