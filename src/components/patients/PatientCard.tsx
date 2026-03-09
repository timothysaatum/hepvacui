import { useNavigate } from 'react-router-dom';
import type { Patient } from '../../types/patient';
import { isPregnantPatient } from '../../types/patient';
import { PatientStatusBadge, PatientTypeBadge } from '../common/Badge';
import { formatDate, getGravidaParaLabel, getInitials } from '../../utils/formatters';

interface PatientCardProps {
    patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
    const navigate = useNavigate();

    const pregnant = isPregnantPatient(patient);
    const edd = pregnant ? patient.active_pregnancy?.expected_delivery_date : null;

    return (
        <div
            onClick={() => navigate(`/patients/${patient.id}`)}
            className="flex items-center gap-4 px-5 py-4 bg-white border border-slate-200 rounded-xl hover:border-teal-300 hover:shadow-sm cursor-pointer transition-all group"
        >
            {/* Avatar */}
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${pregnant ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {getInitials(patient.name)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 truncate">{patient.name}</span>
                    <PatientTypeBadge type={patient.patient_type} />
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    <span>{patient.phone}</span>
                    {patient.age && <span>{patient.age} yrs</span>}
                    {pregnant && (
                        <span className="text-purple-600 font-medium">
                            {getGravidaParaLabel(patient.gravida, patient.para)}
                        </span>
                    )}
                    {edd && (
                        <span className="text-amber-600">EDD: {formatDate(edd)}</span>
                    )}
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 shrink-0">
                <PatientStatusBadge status={patient.status} />
                <svg className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );
}
