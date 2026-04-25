import { Eye, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Patient } from '../../types/patient';
import { isPregnantPatient } from '../../types/patient';
import { PatientStatusBadge, PatientTypeBadge } from '../common/Badge';
import { getInitials } from '../../utils/formatters';

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  const navigate = useNavigate();
  const pregnant = isPregnantPatient(patient);

  return (
    <div
      onClick={() => navigate(`/patients/${patient.id}`)}
      className="group grid grid-cols-12 items-center gap-4 px-4 py-4 bg-white border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 cursor-pointer transition-colors"
    >
      <div className="col-span-4 flex items-center gap-3 min-w-0">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
            pregnant
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {getInitials(patient.name)}
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-slate-900 truncate">{patient.name}</p>
          <p className="text-xs text-slate-500 truncate">{patient.phone}</p>
        </div>
      </div>

      <div className="col-span-2">
        <PatientTypeBadge type={patient.patient_type} />
      </div>

      <div className="col-span-2">
        <PatientStatusBadge status={patient.status} />
      </div>

      <div className="col-span-2 text-sm text-slate-600">{patient.phone}</div>

      <div className="col-span-1 text-sm text-slate-600">
        {patient.age ? `${patient.age} yrs` : '—'}
      </div>

      <div className="col-span-1 flex justify-end gap-2">
        <button
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/patients/${patient.id}`);
          }}
          className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-teal-600 hover:border-teal-200 flex items-center justify-center transition-colors"
          title="View patient"
        >
          <Eye className="w-4 h-4" />
        </button>

        <button
          className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-400 group-hover:text-teal-600 group-hover:border-teal-200 flex items-center justify-center transition-colors"
          title="Open patient"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}