import { useNavigate } from 'react-router-dom';
import type { Patient } from '../../types/patient';
import { isPregnantPatient } from '../../types/patient';
import { PatientStatusBadge, PatientTypeBadge } from '../common/Badge';
import { formatDate, getGravidaParaLabel, getInitials } from '../../utils/formatters';
import { ChevronRight } from 'lucide-react';

interface PatientCardProps {
    patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
    const navigate = useNavigate();

    const pregnant = isPregnantPatient(patient);
    const gravida = pregnant && typeof patient.gravida === 'number' ? patient.gravida : null;
    const para = pregnant && typeof patient.para === 'number' ? patient.para : null;
    const edd = pregnant ? patient.active_pregnancy?.expected_delivery_date : null;
    const hasPregnancyCounts = gravida !== null && para !== null;

    return (
        <button
            type="button"
            onClick={() => navigate(`/patients/${patient.id}?type=${patient.patient_type}`)}
            className="grid w-full grid-cols-[minmax(220px,1.7fr)_130px_120px_minmax(130px,1fr)_36px] items-center gap-4 border-b border-slate-100 bg-white px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-50"
        >
            <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-bold ${pregnant ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
                    {getInitials(patient.name)}
                </div>
                <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-900">{patient.name || 'Unnamed patient'}</span>
                        {patient.medical_record_number && (
                            <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                                {patient.medical_record_number}
                            </span>
                        )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                        <span>{patient.phone || 'No phone'}</span>
                        {patient.age !== null && patient.age !== undefined && <span>{patient.age} yrs</span>}
                    </div>
                </div>
            </div>

            <div>
                <PatientTypeBadge type={patient.patient_type} />
            </div>

            <div>
                <PatientStatusBadge status={patient.status} />
            </div>

            <div className="min-w-0 text-xs text-slate-500">
                {pregnant ? (
                    <div className="truncate">
                        {hasPregnancyCounts ? (
                            <span className="font-semibold text-violet-700">{getGravidaParaLabel(gravida, para)}</span>
                        ) : (
                            <span className="font-semibold text-violet-700">Pregnancy care</span>
                        )}
                        {edd && <span className="ml-2 text-amber-700">EDD {formatDate(edd)}</span>}
                    </div>
                ) : (
                    <span className="text-slate-400">Long-term care</span>
                )}
            </div>

            <ChevronRight className="h-4 w-4 justify-self-end text-slate-300" />
        </button>
    );
}
