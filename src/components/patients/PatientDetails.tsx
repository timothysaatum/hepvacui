// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import type { Patient, RegularPatient } from '../../types/patient';
// import type { VaccinePurchase } from '../../types/vaccinePurchase';
// import { usePregnantPatient, useRegularPatient } from '../../hooks/usePatients';
// import { PatientPurchaseList } from '../../components/patients/PatientPurchaseList';
// import { PurchaseVaccinePanel } from '../../components/purchases/PurchaseVaccinePanel';
// import { PaymentPanel } from '../../components/purchases/PaymentPanel';
// import { AdministerVaccinationPanel } from '../../components/purchases/AdministerVaccinationPanel';
// import { formatDate } from '../../utils/formatters';

// export const PatientDetailPage: React.FC = () => {
//   const { patientId } = useParams<{ patientId: string }>();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState<'info' | 'purchases'>('info');
  
//   // Slide-over panel states
//   const [purchaseVaccinePatient, setPurchaseVaccinePatient] = useState<Patient | null>(null);
//   const [paymentPurchase, setPaymentPurchase] = useState<VaccinePurchase | null>(null);
//   const [administerPurchase, setAdministerPurchase] = useState<VaccinePurchase | null>(null);

//   // Fetch patient data - try both types
//   const { data: pregnantData, isLoading: pregnantLoading } = usePregnantPatient(patientId || null);
//   const { data: regularData, isLoading: regularLoading } = useRegularPatient(patientId || null);

//   const isLoading = pregnantLoading || regularLoading;
//   const patient = pregnantData || regularData;
//   const isPregnant = patient?.patient_type === 'pregnant';

//   const getPatientTypeDisplay = () => {
//     if (isPregnant) {
//       return {
//         icon: '🤰',
//         label: 'Pregnant Patient',
//         className: 'bg-pink-100 text-pink-800',
//       };
//     }
//     return {
//       icon: '👤',
//       label: 'Regular Patient',
//       className: 'bg-blue-100 text-blue-800',
//     };
//   };

//   const getStatusDisplay = () => {
//     if (!patient) return { text: 'Unknown', className: 'bg-gray-100 text-gray-800' };
    
//     switch (patient.status) {
//       case 'active':
//         return { text: 'Active', className: 'bg-green-100 text-green-800' };
//       case 'inactive':
//         return { text: 'Inactive', className: 'bg-gray-100 text-gray-800' };
//       case 'converted':
//         return { text: 'Converted', className: 'bg-purple-100 text-purple-800' };
//       default:
//         return { text: patient.status, className: 'bg-gray-100 text-gray-800' };
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-96">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
//           <p className="text-gray-500 text-lg">Loading patient details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!patient) {
//     return (
//       <div className="bg-white rounded-lg shadow p-12 text-center">
//         <div className="text-6xl mb-4">⚠️</div>
//         <h3 className="text-xl font-medium text-gray-900 mb-2">Patient Not Found</h3>
//         <p className="text-gray-500 mb-6">
//           The patient you're looking for doesn't exist or you don't have permission to view it.
//         </p>
//         <button
//           onClick={() => navigate('/patients')}
//           className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//         >
//           Back to Patients
//         </button>
//       </div>
//     );
//   }

//   const typeDisplay = getPatientTypeDisplay();
//   const statusDisplay = getStatusDisplay();

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//         <div className="flex justify-between items-start mb-6">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => navigate('/patients')}
//               className="text-gray-400 hover:text-gray-600 transition-colors"
//               title="Back to Patients"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//               </svg>
//             </button>
//             <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-4xl">
//               {typeDisplay.icon}
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
//               <p className="text-gray-600 mt-1">{patient.phone}</p>
//               <div className="flex gap-2 mt-3">
//                 <span className={`px-3 py-1 text-xs font-semibold rounded-full ${typeDisplay.className}`}>
//                   {typeDisplay.label}
//                 </span>
//                 <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusDisplay.className}`}>
//                   {statusDisplay.text}
//                 </span>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex gap-3">
//             <button
//               onClick={() => setPurchaseVaccinePatient(patient)}
//               className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-colors"
//             >
//               💉 Purchase Vaccine
//             </button>
//             <button
//               onClick={() => navigate(`/patients/${patientId}/edit`)}
//               className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium transition-colors"
//             >
//               ✏️ Edit Patient
//             </button>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="border-b border-gray-200">
//           <div className="flex gap-6">
//             <button
//               onClick={() => setActiveTab('info')}
//               className={`py-3 px-1 border-b-2 font-medium transition-colors ${
//                 activeTab === 'info'
//                   ? 'border-purple-500 text-purple-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               📋 Patient Information
//             </button>
//             <button
//               onClick={() => setActiveTab('purchases')}
//               className={`py-3 px-1 border-b-2 font-medium transition-colors ${
//                 activeTab === 'purchases'
//                   ? 'border-purple-500 text-purple-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               💉 Vaccine Purchases & History
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Tab Content */}
//       {activeTab === 'info' && (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Basic Information */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//               <span className="mr-2">📋</span>
//               Basic Information
//             </h3>
//             <div className="space-y-4">
//               <InfoRow label="Full Name" value={patient.name} />
//               <InfoRow label="Phone Number" value={patient.phone} />
//               <InfoRow label="Age" value={`${patient.age} years`} />
//               <InfoRow 
//                 label="Sex" 
//                 value={isPregnant ? 'Female' : (regularData as RegularPatient)?.sex === 'male' ? 'Male' : 'Female'} 
//               />
//               <InfoRow label="Patient ID" value={patient.id} />
//             </div>
//           </div>

//           {/* Pregnant-specific Information */}
//           {isPregnant && pregnantData && (
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                 <span className="mr-2">🤰</span>
//                 Pregnancy Information
//               </h3>
//               <div className="space-y-4">
//                 <InfoRow 
//                   label="Expected Delivery Date" 
//                   value={formatDate(pregnantData.expected_delivery_date)} 
//                 />
//                 <InfoRow 
//                   label="Actual Delivery Date" 
//                   value={pregnantData.actual_delivery_date ? formatDate(pregnantData.actual_delivery_date) : 'Not delivered yet'} 
//                 />
//               </div>
//             </div>
//           )}

//           {/* Regular Patient Medical Information */}
//           {!isPregnant && regularData && (
//             <>
//               <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <span className="mr-2">🏥</span>
//                   Medical Information
//                 </h3>
//                 <div className="space-y-4">
//                   <InfoRow 
//                     label="Diagnosis Date" 
//                     value={regularData.diagnosis_date ? formatDate(regularData.diagnosis_date) : 'N/A'} 
//                   />
//                   <InfoRow 
//                     label="Treatment Start Date" 
//                     value={regularData.treatment_start_date ? formatDate(regularData.treatment_start_date) : 'N/A'} 
//                   />
//                   <InfoRow 
//                     label="Viral Load" 
//                     value={regularData.viral_load || 'N/A'} 
//                   />
//                   <InfoRow 
//                     label="Last Viral Load Date" 
//                     value={regularData.last_viral_load_date ? formatDate(regularData.last_viral_load_date) : 'N/A'} 
//                   />
//                   <InfoRow 
//                     label="Treatment Regimen" 
//                     value={regularData.treatment_regimen || 'N/A'} 
//                   />
//                 </div>
//               </div>

//               {(regularData.allergies || regularData.medical_history || regularData.notes) && (
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                     <span className="mr-2">📝</span>
//                     Additional Notes
//                   </h3>
//                   <div className="space-y-4">
//                     {regularData.allergies && (
//                       <InfoRow label="Allergies" value={regularData.allergies} isTextArea />
//                     )}
//                     {regularData.medical_history && (
//                       <InfoRow label="Medical History" value={regularData.medical_history} isTextArea />
//                     )}
//                     {regularData.notes && (
//                       <InfoRow label="Notes" value={regularData.notes} isTextArea />
//                     )}
//                   </div>
//                 </div>
//               )}
//             </>
//           )}

//           {/* System Information */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//               <span className="mr-2">⚙️</span>
//               System Information
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               <InfoRow label="Created At" value={formatDate(patient.created_at, 'long')} />
//               <InfoRow label="Updated At" value={formatDate(patient.updated_at, 'long')} />
//               <InfoRow label="Facility ID" value={patient.facility_id} />
//               <InfoRow label="Created By ID" value={patient.created_by_id} />
//             </div>
//           </div>
//         </div>
//       )}

//       {activeTab === 'purchases' && (
//         <PatientPurchaseList
//           patientId={patientId!}
//           onViewDetails={(purchaseId) => {
//             // For now, you can navigate or open a panel
//             // The inline expansion is handled within PatientPurchaseList
//           }}
//           onMakePayment={setPaymentPurchase}
//           onAdministerDose={setAdministerPurchase}
//         />
//       )}

//       {/* Slide-over Panels */}
//       <PurchaseVaccinePanel
//         patient={purchaseVaccinePatient}
//         onClose={() => setPurchaseVaccinePatient(null)}
//         onSuccess={() => {
//           setPurchaseVaccinePatient(null);
//           // Optionally switch to purchases tab to see the new purchase
//           setActiveTab('purchases');
//         }}
//       />

//       <PaymentPanel
//         purchase={paymentPurchase}
//         onClose={() => setPaymentPurchase(null)}
//         onSuccess={() => setPaymentPurchase(null)}
//       />

//       <AdministerVaccinationPanel
//         purchase={administerPurchase}
//         onClose={() => setAdministerPurchase(null)}
//         onSuccess={() => setAdministerPurchase(null)}
//       />
//     </div>
//   );
// };

// // Helper component for displaying information rows
// const InfoRow: React.FC<{
//   label: string;
//   value: string;
//   isTextArea?: boolean;
// }> = ({ label, value, isTextArea = false }) => {
//   return (
//     <div>
//       <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
//       {isTextArea ? (
//         <dd className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-200 whitespace-pre-wrap">
//           {value}
//         </dd>
//       ) : (
//         <dd className="text-sm text-gray-900 font-medium">{value}</dd>
//       )}
//     </div>
//   );
// };
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Heart, Activity, Calendar, Phone, Pill, CreditCard, Syringe, FileText, TrendingUp, AlertCircle, Check, X, ChevronRight, ArrowLeft, Edit3, Trash2, Eye, RefreshCw } from 'lucide-react';
import type { Patient, RegularPatient } from '../../types/patient';
import type { VaccinePurchase } from '../../types/vaccinePurchase';
import { usePregnantPatient, useRegularPatient } from '../../hooks/usePatients';
import { usePatientPurchases } from '../../hooks/useVaccinePurchases';
import { PurchaseVaccinePanel } from '../../components/purchases/PurchaseVaccinePanel';
import { PaymentPanel } from '../../components/purchases/PaymentPanel';
import { AdministerVaccinationPanel } from '../../components/purchases/AdministerVaccinationPanel';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const PatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'purchases'>('overview');

  // Slide-over panel states
  const [purchaseVaccinePatient, setPurchaseVaccinePatient] = useState<Patient | null>(null);
  const [paymentPurchase, setPaymentPurchase] = useState<VaccinePurchase | null>(null);
  const [administerPurchase, setAdministerPurchase] = useState<VaccinePurchase | null>(null);
  const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null);

  // Fetch patient data
  const { data: pregnantData, isLoading: pregnantLoading } = usePregnantPatient(patientId || null);
  const { data: regularData, isLoading: regularLoading } = useRegularPatient(patientId || null);
  const { data: purchases, isLoading: purchasesLoading } = usePatientPurchases(patientId || '', false);

  const isLoading = pregnantLoading || regularLoading;
  const patient = pregnantData || regularData;
  const isPregnant = patient?.patient_type === 'pregnant';

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-gray-100 text-black border-gray-200',
      inactive: 'bg-gray-50 text-gray-600 border-gray-200',
      converted: 'bg-gray-100 text-black border-gray-200'
    };
    return styles[status as keyof typeof styles] || styles.inactive;
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-gray-100 text-black border-gray-200',
      partial: 'bg-gray-100 text-black border-gray-200',
      unpaid: 'bg-gray-50 text-gray-600 border-gray-200'
    };
    return styles[status as keyof typeof styles] || styles.unpaid;
  };

  // Calculate totals
  const totalSpent = purchases?.reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0;
  const totalBalance = purchases?.reduce((sum, p) => sum + Number(p.balance), 0) || 0;
  const totalDoses = purchases?.reduce((sum, p) => sum + p.doses_administered, 0) || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-black mb-4"></div>
          <p className="text-gray-500 text-lg">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-medium text-black mb-2">Patient Not Found</h3>
        <p className="text-gray-500 mb-6">
          The patient you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <button
          onClick={() => navigate('/patients')}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
        >
          Back to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-white p-8 border-b border-gray-200">
            <div className="flex items-start justify-between mb-8">
              <button
                onClick={() => navigate('/patients')}
                className="text-gray-600 hover:text-black transition-colors group"
              >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setPurchaseVaccinePatient(patient)}
                  className="px-5 py-2.5 bg-black hover:bg-gray-900 text-white rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Syringe className="w-4 h-4" />
                  Purchase Vaccine
                </button>
                <button
                  onClick={() => navigate(`/patients/${patientId}/edit`)}
                  className="px-5 py-2.5 bg-white text-black hover:bg-gray-50 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 border border-gray-200"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Patient
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center shadow-sm border border-gray-200">
                <Heart className="w-12 h-12 text-black" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-black">{patient.name}</h1>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-lg border ${getStatusBadge(patient.status)}`}>
                    {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-black">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{patient.age} years</span>
                  </div>
                  <div className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-semibold border border-gray-200">
                    {isPregnant ? 'Pregnant Patient' : 'Regular Patient'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white px-8">
            <div className="flex gap-8">
              {['overview', 'purchases'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'overview' | 'purchases')}
                  className={`py-4 px-2 font-semibold text-sm transition-all relative ${activeTab === tab
                      ? 'text-black'
                      : 'text-gray-500 hover:text-black'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-lg font-bold text-black">Basic Information</h3>
              </div>
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-black" />
                  </div>
                  <h3 className="text-lg font-bold text-black">Pregnancy Information</h3>
                </div>
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-black" />
                    </div>
                    <h3 className="text-lg font-bold text-black">Medical Information</h3>
                  </div>
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
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-black" />
                      </div>
                      <h3 className="text-lg font-bold text-black">Additional Notes</h3>
                    </div>
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:col-span-2 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-lg font-bold text-black">System Information</h3>
              </div>
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
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Paid"
                value={formatCurrency(totalSpent)}
                icon={<CreditCard className="w-6 h-6" />}
              />
              <StatCard
                title="Outstanding Balance"
                value={formatCurrency(totalBalance)}
                icon={<TrendingUp className="w-6 h-6" />}
              />
              <StatCard
                title="Doses Administered"
                value={totalDoses.toString()}
                icon={<Syringe className="w-6 h-6" />}
              />
            </div>

            {/* Purchase History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2">
                <Pill className="w-5 h-5 text-black" />
                Purchase History
              </h3>

              {purchasesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : !purchases || purchases.length === 0 ? (
                <div className="text-center py-12">
                  <Syringe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No vaccine purchases yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <PurchaseCard
                      key={purchase.id}
                      purchase={purchase}
                      isExpanded={expandedPurchase === purchase.id}
                      onToggle={() => setExpandedPurchase(expandedPurchase === purchase.id ? null : purchase.id)}
                      getPaymentStatusBadge={getPaymentStatusBadge}
                      onMakePayment={() => setPaymentPurchase(purchase)}
                      onAdministerDose={() => setAdministerPurchase(purchase)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Panels */}
      <PurchaseVaccinePanel
        patient={purchaseVaccinePatient}
        onClose={() => setPurchaseVaccinePatient(null)}
        onSuccess={() => {
          setPurchaseVaccinePatient(null);
          setActiveTab('purchases');
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

// Helper Components
const InfoRow: React.FC<{
  label: string;
  value: string;
  isTextArea?: boolean;
}> = ({ label, value, isTextArea = false }) => {
  return (
    <div className={isTextArea ? '' : 'flex justify-between items-center py-2 border-b border-gray-100 last:border-0'}>
      {isTextArea ? (
        <>
          <dt className="text-sm font-medium text-gray-600 mb-1">{label}</dt>
          <dd className="text-sm text-black bg-gray-50 p-3 rounded-md border border-gray-200 whitespace-pre-wrap">
            {value}
          </dd>
        </>
      ) : (
        <>
          <span className="text-sm font-medium text-gray-600">{label}</span>
          <span className="text-sm font-semibold text-black">{value}</span>
        </>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactElement;
}> = ({ title, value, icon }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-105">
    <div className="flex items-center justify-between mb-3">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
        {React.cloneElement(icon, { className: 'w-6 h-6 text-black' })}
      </div>
    </div>
    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
    <p className="text-3xl font-bold text-black">{value}</p>
  </div>
);

const PurchaseCard: React.FC<{
  purchase: VaccinePurchase;
  isExpanded: boolean;
  onToggle: () => void;
  getPaymentStatusBadge: (status: string) => string;
  onMakePayment: () => void;
  onAdministerDose: () => void;
}> = ({ purchase, isExpanded, onToggle, getPaymentStatusBadge, onMakePayment, onAdministerDose }) => {
  const getPaymentStatus = (): string => {
    if (purchase.balance === 0) return 'paid';
    if (purchase.amount_paid > 0) return 'partial';
    return 'unpaid';
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all hover:shadow-sm">
      <div
        className="p-4 bg-gray-50 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-bold text-black">{purchase.vaccine_name}</h4>
              <span className={`px-2 py-1 text-xs font-semibold rounded-lg border ${getPaymentStatusBadge(getPaymentStatus())}`}>
                {getPaymentStatus().charAt(0).toUpperCase() + getPaymentStatus().slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Syringe className="w-4 h-4" />
                {purchase.doses_administered}/{purchase.total_doses} doses
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="w-4 h-4" />
                {formatCurrency(purchase.amount_paid)} / {formatCurrency(purchase.total_package_price)}
              </span>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 bg-white border-t border-gray-200 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">Batch Number</p>
              <p className="text-sm font-semibold text-black">{purchase.batch_number}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">Price per Dose</p>
              <p className="text-sm font-semibold text-black">{formatCurrency(purchase.price_per_dose)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">Amount Paid</p>
              <p className="text-sm font-semibold text-black">{formatCurrency(purchase.amount_paid)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">Balance</p>
              <p className="text-sm font-semibold text-black">{formatCurrency(purchase.balance)}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMakePayment();
              }}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 hover:scale-105 transition-all text-sm flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Make Payment
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdministerDose();
              }}
              className="flex-1 px-4 py-2 bg-gray-100 text-black rounded-lg font-medium hover:bg-gray-200 hover:scale-105 transition-all text-sm flex items-center justify-center gap-2 border border-gray-200"
            >
              <Syringe className="w-4 h-4" />
              Administer Dose
            </button>
          </div>
        </div>
      )}
    </div>
  );
};