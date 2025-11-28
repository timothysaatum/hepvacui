import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Patient, PregnantPatient } from '../../types/patient';
import { PatientList } from '../../components/patients/PatientList';
import { CreatePatientForm } from '../../components/patients/CreatePatientForm';
import { EditPatientForm } from '../../components/patients/EditPatientForm';
import { ConvertPatientModal } from '../../components/patients/ConvertPatientModal';
import { Plus, ArrowLeft } from 'lucide-react';

type ViewMode = 'list' | 'create' | 'edit';

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [convertPatient, setConvertPatient] = useState<PregnantPatient | null>(null);

  const handleCreateClick = () => {
    setViewMode('create');
    setSelectedPatient(null);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewMode('edit');
  };

  const handleViewDetails = (patient: Patient) => {
    navigate(`/patients/${patient.id}`);
  };

  const handleConvert = (patient: Patient) => {
    if (patient.patient_type === 'pregnant') {
      setConvertPatient(patient as PregnantPatient);
    }
  };

  const handleSuccess = () => {
    setViewMode('list');
    setSelectedPatient(null);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedPatient(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {viewMode === 'list' && 'Patient Records'}
            {viewMode === 'create' && 'Add New Patient'}
            {viewMode === 'edit' && 'Edit Patient'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {viewMode === 'list' && 'Manage patient records and medical information'}
            {viewMode === 'create' && 'Register a new patient in the system'}
            {viewMode === 'edit' && 'Update patient information'}
          </p>
        </div>

        {viewMode === 'list' && (
          <button
            onClick={handleCreateClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 font-medium transition-all hover:scale-105 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Patient
          </button>
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
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