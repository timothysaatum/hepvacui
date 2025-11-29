// src/components/search/PatientSearchCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Calendar, Heart, ChevronRight } from 'lucide-react';
import type { PatientSearchResult } from '../../types/search';
import { formatDate } from '../../utils/formatters';

interface PatientSearchCardProps {
    patient: PatientSearchResult;
}

export const PatientSearchCard: React.FC<PatientSearchCardProps> = ({ patient }) => {
    const navigate = useNavigate();

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-gray-100 text-black border-gray-200',
            inactive: 'bg-gray-50 text-gray-600 border-gray-200',
            converted: 'bg-gray-100 text-black border-gray-200',
            postpartum: 'bg-gray-100 text-black border-gray-200',
            completed: 'bg-gray-100 text-black border-gray-200',
        };
        return styles[status] || styles.inactive;
    };

    return (
        <div
            onClick={() => navigate(`/patients/${patient.id}`)}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                        <Heart className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-black">{patient.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Phone className="w-4 h-4" />
                            {patient.phone}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-lg border ${getStatusBadge(patient.status)}`}>
                        {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-semibold border border-gray-200">
                        {patient.patient_type === 'pregnant' ? 'Pregnant' : 'Regular'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                        {patient.age} years, {patient.sex === 'male' ? 'Male' : 'Female'}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Created {formatDate(patient.created_at)}</span>
                </div>
            </div>

            {patient.patient_type === 'pregnant' && patient.expected_delivery_date && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Expected Delivery</p>
                    <p className="text-sm font-semibold text-black">
                        {formatDate(patient.expected_delivery_date)}
                    </p>
                </div>
            )}

            {patient.patient_type === 'regular' && patient.diagnosis_date && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Diagnosis Date</p>
                    <p className="text-sm font-semibold text-black">
                        {formatDate(patient.diagnosis_date)}
                    </p>
                </div>
            )}

            <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600 flex items-center gap-1 group-hover:text-black transition-colors">
                    View Details
                    <ChevronRight className="w-4 h-4" />
                </span>
            </div>
        </div>
    );
};