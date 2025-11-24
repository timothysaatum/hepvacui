import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Patient, PregnantPatient } from '../../types/patient';
import { PatientList } from '../../components/patients/PatientList';
import { CreatePatientForm } from '../../components/patients/CreatePatientForm';
import { EditPatientForm } from '../../components/patients/EditPatientForm';
import { ConvertPatientModal } from '../../components/patients/ConvertPatientModal';

type ViewMode = 'list' | 'create' | 'edit';

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [convertPatient, setConvertPatient] = useState<PregnantPatient | null>(null);

  // Handle creating new patient
  const handleCreateClick = () => {
    setViewMode('create');
    setSelectedPatient(null);
  };

  // Handle editing patient
  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewMode('edit');
  };

  // Handle viewing patient details - navigate to detail page
  const handleViewDetails = (patient: Patient) => {
    navigate(`/patients/${patient.id}`);
  };

  // Handle converting pregnant patient
  const handleConvert = (patient: Patient) => {
    if (patient.patient_type === 'pregnant') {
      setConvertPatient(patient as PregnantPatient);
    }
  };

  // Handle success actions
  const handleSuccess = () => {
    setViewMode('list');
    setSelectedPatient(null);
  };

  // Handle cancel actions
  const handleCancel = () => {
    setViewMode('list');
    setSelectedPatient(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">
            Manage patient records and medical information
          </p>
        </div>

        {viewMode === 'list' && (
          <button
            onClick={handleCreateClick}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Patient
          </button>
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors font-medium"
          >
            ← Back to List
          </button>
        )}
      </div>

      {/* Content */}
      {viewMode === 'list' && (
        <PatientList
          onEdit={handleEdit}
          onViewDetails={handleViewDetails}
          onConvert={handleConvert}
        />
      )}

      {viewMode === 'create' && (
        <CreatePatientForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      {viewMode === 'edit' && selectedPatient && (
        <EditPatientForm
          patient={selectedPatient}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      {/* Modals */}
      {convertPatient && (
        <ConvertPatientModal
          patient={convertPatient}
          onClose={() => setConvertPatient(null)}
          onSuccess={() => setConvertPatient(null)}
        />
      )}
    </div>
  );
};