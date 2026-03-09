import { useNavigate } from 'react-router-dom';
import type { Patient } from '../../types/patient';
import { isPregnantPatient } from '../../types/patient';
import { PatientStatusBadge, PatientTypeBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatDate, getGravidaParaLabel, getInitials } from '../../utils/formatters';

interface PatientHeaderProps {
    patient: Patient;
    onConvert?: () => void;
}

export function PatientHeader({ patient, onConvert }: PatientHeaderProps) {
    const navigate = useNavigate();
    const pregnant = isPregnantPatient(patient);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-5">
                {/* Back */}
                <button
                    onClick={() => navigate('/patients')}
                    className="mt-1 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Avatar */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0 ${pregnant ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {getInitials(patient.name)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
                        <PatientTypeBadge type={patient.patient_type} />
                        <PatientStatusBadge status={patient.status} />
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                        <span>📞 {patient.phone}</span>
                        {patient.date_of_birth && <span>🎂 {formatDate(patient.date_of_birth)}</span>}
                        {patient.age && <span>Age {patient.age}</span>}
                        {patient.facility && <span>🏥 {patient.facility.name}</span>}
                        {pregnant && (
                            <span className="text-purple-600 font-semibold">
                                {getGravidaParaLabel(patient.gravida, patient.para)}
                            </span>
                        )}
                    </div>

                    {/* Active pregnancy banner */}
                    {pregnant && patient.active_pregnancy && (
                        <div className="mt-3 inline-flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-sm">
                            <span className="text-purple-700 font-medium">🤰 Active Pregnancy #{patient.active_pregnancy.pregnancy_number}</span>
                            {patient.active_pregnancy.expected_delivery_date && (
                                <span className="text-slate-500">
                                    EDD: <strong className="text-slate-700">{formatDate(patient.active_pregnancy.expected_delivery_date)}</strong>
                                </span>
                            )}
                            {patient.active_pregnancy.gestational_age_weeks && (
                                <span className="text-slate-500">
                                    <strong className="text-slate-700">{patient.active_pregnancy.gestational_age_weeks}w</strong> gestation
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/patients/${patient.id}/edit`)}
                    >
                        Edit
                    </Button>
                    {pregnant && patient.status === 'active' && onConvert && (
                        <Button variant="secondary" size="sm" onClick={onConvert}>
                            Convert to Regular
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
