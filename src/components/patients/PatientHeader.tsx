import { useNavigate } from 'react-router-dom';
import type { Patient } from '../../types/patient';
import { isPregnantPatient } from '../../types/patient';
import { PatientStatusBadge, PatientTypeBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatDate, getGravidaParaLabel, getInitials } from '../../utils/formatters';
import { ArrowLeft, Edit3, Repeat2, Shuffle } from 'lucide-react';

interface PatientHeaderProps {
    patient: Patient;
    onConvert?: () => void;
    onReRegisterPregnant?: () => void;
}

export function PatientHeader({ patient, onConvert, onReRegisterPregnant }: PatientHeaderProps) {
    const navigate = useNavigate();
    const pregnant = isPregnantPatient(patient);
    const canConvertToRegular = pregnant && ['active', 'postpartum'].includes(patient.status);
    const canReRegisterPregnant = !pregnant && patient.sex === 'female';

    return (
        <div className="bg-white border border-slate-200 p-5 mb-5">
            <div className="flex items-start gap-5">
                {/* Back */}
                <button
                    onClick={() => navigate('/patients')}
                    className="mt-1 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                    title="Back to patients"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Avatar */}
                <div className={`w-14 h-14 flex items-center justify-center text-lg font-bold shrink-0 ${pregnant ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
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
                        <span>{patient.phone}</span>
                        {patient.medical_record_number && <span>MRN {patient.medical_record_number}</span>}
                        {patient.date_of_birth && <span>DOB {formatDate(patient.date_of_birth)}</span>}
                        {patient.age && <span>Age {patient.age}</span>}
                        {patient.facility && <span>{patient.facility.name}</span>}
                        {pregnant && (
                            <span className="text-purple-600 font-semibold">
                                {getGravidaParaLabel(patient.gravida, patient.para)}
                            </span>
                        )}
                    </div>

                    {/* Active pregnancy banner */}
                    {pregnant && patient.active_pregnancy && (
                        <div className="mt-3 inline-flex items-center gap-3 bg-violet-50 border border-violet-200 px-4 py-2 text-sm">
                            <span className="text-violet-700 font-medium">Active Pregnancy #{patient.active_pregnancy.pregnancy_number}</span>
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
                        onClick={() => navigate(`/patients/${patient.id}/edit?type=${patient.patient_type}`)}
                    >
                        <Edit3 className="mr-1 h-4 w-4" />
                        Edit
                    </Button>
                    {canConvertToRegular && onConvert && (
                        <Button variant="secondary" size="sm" onClick={onConvert}>
                            <Shuffle className="mr-1 h-4 w-4" />
                            Convert to Regular
                        </Button>
                    )}
                    {canReRegisterPregnant && onReRegisterPregnant && (
                        <Button variant="secondary" size="sm" onClick={onReRegisterPregnant}>
                            <Repeat2 className="mr-1 h-4 w-4" />
                            Re-register as Pregnant
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
