import type { PatientStatus, PatientType } from '../../types/patient';
import type { ReminderStatus } from '../../types/reminder';
import type { PaymentStatus } from '../../types/vaccinePurchase';
import { cn } from '../../utils/cn';
import {
    PATIENT_STATUS_LABELS, PATIENT_STATUS_COLORS,
    PATIENT_TYPE_LABELS, PATIENT_TYPE_COLORS,
    PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS,
    REMINDER_STATUS_LABELS, REMINDER_STATUS_COLORS,
} from '../../utils/formatters';

interface BadgeProps {
    label: string;
    className?: string;
    dot?: boolean;
}

export function Badge({ label, className, dot }: BadgeProps) {
    return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', className)}>
            {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
            {label}
        </span>
    );
}

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
    return (
        <Badge
            label={PATIENT_STATUS_LABELS[status]}
            className={PATIENT_STATUS_COLORS[status]}
            dot
        />
    );
}

export function PatientTypeBadge({ type }: { type: PatientType }) {
    return (
        <Badge
            label={PATIENT_TYPE_LABELS[type]}
            className={PATIENT_TYPE_COLORS[type]}
        />
    );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
    return (
        <Badge
            label={PAYMENT_STATUS_LABELS[status]}
            className={PAYMENT_STATUS_COLORS[status]}
            dot
        />
    );
}

export function ReminderStatusBadge({ status }: { status: ReminderStatus }) {
    return (
        <Badge
            label={REMINDER_STATUS_LABELS[status]}
            className={REMINDER_STATUS_COLORS[status]}
            dot
        />
    );
}
