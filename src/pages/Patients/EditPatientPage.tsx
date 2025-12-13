import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EditPatientForm } from '../../components/patients/EditPatientForm';
import { usePatient } from '../../hooks/usePatients';

export const EditPatientPage: React.FC = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();

    const { data: patient, isPending, error } = usePatient(patientId || null);

    const handleSuccess = () => {
        navigate(`/patients/${patientId}`);
    };

    const handleCancel = () => {
        navigate(`/patients/${patientId}`);
    };

    if (isPending) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-500 text-lg">Loading patient data...</p>
                </div>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Patient Not Found</h3>
                <p className="text-gray-500 mb-6">
                    The patient you're trying to edit doesn't exist or you don't have permission to edit it.
                </p>
                <button
                    onClick={() => navigate('/patients')}
                    className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                    Back to Patients
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(`/patients/${patientId}`)}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    title="Back to Patient Details"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Edit Patient</h1>
            </div>

            <EditPatientForm
                patient={patient}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
};