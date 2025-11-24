import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Patient, RegularPatient } from '../../types/patient';
import type { VaccinePurchase } from '../../types/vaccinePurchase';
import { usePregnantPatient, useRegularPatient } from '../../hooks/usePatients';
import { PatientPurchaseList } from '../../components/patients/PatientPurchaseList';
import { PurchaseVaccinePanel } from '../../components/purchases/PurchaseVaccinePanel';
import { PaymentPanel } from '../../components/purchases/PaymentPanel';
import { AdministerVaccinationPanel } from '../../components/purchases/AdministerVaccinationPanel';
import { formatDate } from '../../utils/formatters';

export const PatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'purchases'>('info');
  
  const [purchaseVaccinePatient, setPurchaseVaccinePatient] = useState<Patient | null>(null);
  const [paymentPurchase, setPaymentPurchase] = useState<VaccinePurchase | null>(null);
  const [administerPurchase, setAdministerPurchase] = useState<VaccinePurchase | null>(null);

  // Fetch patient data - try both types
  const { data: pregnantData, isLoading: pregnantLoading } = usePregnantPatient(patientId || null);
  const { data: regularData, isLoading: regularLoading } = useRegularPatient(patientId || null);

  const isLoading = pregnantLoading || regularLoading;
  const patient = pregnantData || regularData;
  const isPregnant = patient?.patient_type === 'pregnant';

  const getPatientTypeDisplay = () => {
    if (isPregnant) {
      return {
        icon: '🤰',
        label: 'Pregnant Patient',
        className: 'bg-pink-100 text-pink-800',
      };
    }
    return {
      icon: '👤',
      label: 'Regular Patient',
      className: 'bg-blue-100 text-blue-800',
    };
  };

  const getStatusDisplay = () => {
    if (!patient) return { text: 'Unknown', className: 'bg-gray-100 text-gray-800' };
    
    switch (patient.status) {
      case 'active':
        return { text: 'Active', className: 'bg-green-100 text-green-800' };
      case 'inactive':
        return { text: 'Inactive', className: 'bg-gray-100 text-gray-800' };
      case 'converted':
        return { text: 'Converted', className: 'bg-purple-100 text-purple-800' };
      default:
        return { text: patient.status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-500 text-lg">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">Patient Not Found</h3>
        <p className="text-gray-500 mb-6">
          The patient you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <button
          onClick={() => navigate('/patients')}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Back to Patients
        </button>
      </div>
    );
  }

  const typeDisplay = getPatientTypeDisplay();
  const statusDisplay = getStatusDisplay();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/patients')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Back to Patients"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-4xl">
              {typeDisplay.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-gray-600 mt-1">{patient.phone}</p>
              <div className="flex gap-2 mt-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${typeDisplay.className}`}>
                  {typeDisplay.label}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusDisplay.className}`}>
                  {statusDisplay.text}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setPurchaseVaccinePatient(patient)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-colors"
            >
              💉 Purchase Vaccine
            </button>
            <button
              onClick={() => navigate(`/patients/${patientId}/edit`)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium transition-colors"
            >
              ✏️ Edit Patient
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'info'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Patient Information
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'purchases'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              💉 Vaccine Purchases & History
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Basic Information
            </h3>
            <div className="space-y-4">
              <InfoRow label="Full Name" value={patient.name} />
              <InfoRow label="Phone Number" value={patient.phone} />
              <InfoRow label="Age" value={`${patient.age} years`} />
              <InfoRow 
                label="Sex" 
                value={isPregnant ? 'Female' : (regularData as RegularPatient)?.sex === 'male' ? 'Male' : 'Female'} 
              />
              <InfoRow label="Patient ID" value={patient.id} />
            </div>
          </div>

          {/* Pregnant-specific Information */}
          {isPregnant && pregnantData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🤰</span>
                Pregnancy Information
              </h3>
              <div className="space-y-4">
                <InfoRow 
                  label="Expected Delivery Date" 
                  value={formatDate(pregnantData.expected_delivery_date)} 
                />
                <InfoRow 
                  label="Actual Delivery Date" 
                  value={pregnantData.actual_delivery_date ? formatDate(pregnantData.actual_delivery_date) : 'Not delivered yet'} 
                />
              </div>
            </div>
          )}

          {/* Regular Patient Medical Information */}
          {!isPregnant && regularData && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🏥</span>
                  Medical Information
                </h3>
                <div className="space-y-4">
                  <InfoRow 
                    label="Diagnosis Date" 
                    value={regularData.diagnosis_date ? formatDate(regularData.diagnosis_date) : 'N/A'} 
                  />
                  <InfoRow 
                    label="Treatment Start Date" 
                    value={regularData.treatment_start_date ? formatDate(regularData.treatment_start_date) : 'N/A'} 
                  />
                  <InfoRow 
                    label="Viral Load" 
                    value={regularData.viral_load || 'N/A'} 
                  />
                  <InfoRow 
                    label="Last Viral Load Date" 
                    value={regularData.last_viral_load_date ? formatDate(regularData.last_viral_load_date) : 'N/A'} 
                  />
                  <InfoRow 
                    label="Treatment Regimen" 
                    value={regularData.treatment_regimen || 'N/A'} 
                  />
                </div>
              </div>

              {(regularData.allergies || regularData.medical_history || regularData.notes) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📝</span>
                    Additional Notes
                  </h3>
                  <div className="space-y-4">
                    {regularData.allergies && (
                      <InfoRow label="Allergies" value={regularData.allergies} isTextArea />
                    )}
                    {regularData.medical_history && (
                      <InfoRow label="Medical History" value={regularData.medical_history} isTextArea />
                    )}
                    {regularData.notes && (
                      <InfoRow label="Notes" value={regularData.notes} isTextArea />
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* System Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">⚙️</span>
              System Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoRow label="Created At" value={formatDate(patient.created_at, 'long')} />
              <InfoRow label="Updated At" value={formatDate(patient.updated_at, 'long')} />
              <InfoRow label="Facility ID" value={patient.facility_id} />
              <InfoRow label="Created By ID" value={patient.created_by_id} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'purchases' && (
        <PatientPurchaseList
          patientId={patientId!}
          onMakePayment={setPaymentPurchase}
          onAdministerDose={setAdministerPurchase}
        />
      )}
      <PurchaseVaccinePanel
        patient={purchaseVaccinePatient}
        onClose={() => setPurchaseVaccinePatient(null)}
        onSuccess={() => {
          setPurchaseVaccinePatient(null);
          setActiveTab('purchases'); // Switch to purchases tab after success
        }}
      />

      <PaymentPanel
        purchase={paymentPurchase}
        onClose={() => setPaymentPurchase(null)}
        onSuccess={() => setPaymentPurchase(null)}
      />

      <AdministerVaccinationPanel
        purchase={administerPurchase}
        onClose={() => setAdministerPurchase(null)}
        onSuccess={() => setAdministerPurchase(null)}
      />
    </div>
  );
};

// Helper component for displaying information rows
const InfoRow: React.FC<{
  label: string;
  value: string;
  isTextArea?: boolean;
}> = ({ label, value, isTextArea = false }) => {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      {isTextArea ? (
        <dd className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-200 whitespace-pre-wrap">
          {value}
        </dd>
      ) : (
        <dd className="text-sm text-gray-900 font-medium">{value}</dd>
      )}
    </div>
  );
};