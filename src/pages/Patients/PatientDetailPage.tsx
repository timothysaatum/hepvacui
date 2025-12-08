import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Patient, RegularPatient } from '../../types/patient';
import type { VaccinePurchase } from '../../types/vaccinePurchase';
import { usePatient } from '../../hooks/usePatients';
import { usePatientPurchases } from '../../hooks/useVaccinePurchases';
import { useMotherChildren, useCreateChild, useUpdateChild } from '../../hooks/useChildren';
import { PurchaseVaccinePanel } from '../../components/purchases/PurchaseVaccinePanel';
import { PaymentPanel } from '../../components/purchases/PaymentPanel';
import { AdministerVaccinationPanel } from '../../components/purchases/AdministerVaccinationPanel';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  ArrowLeft,
  Edit3,
  User,
  Heart,
  Activity,
  FileText,
  Calendar,
  Phone,
  Syringe,
  CreditCard,
  TrendingUp,
  Pill,
  ChevronRight,
  Baby,
  Plus,
  X
} from 'lucide-react';

export const PatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'purchases'>('info');
  const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null);

  const [purchaseVaccinePatient, setPurchaseVaccinePatient] = useState<Patient | null>(null);
  const [paymentPurchase, setPaymentPurchase] = useState<VaccinePurchase | null>(null);
  const [administerPurchase, setAdministerPurchase] = useState<VaccinePurchase | null>(null);
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);

  // OPTIMIZATION 1: Single unified hook instead of two separate calls
  // This reduces API calls from 2 to 1
  const { data: patient, isPending } = usePatient(patientId || null);
  
  // Determine patient type first
  const isPregnant = patient?.patient_type === 'pregnant';
  const pregnantData = isPregnant ? patient : null;
  const regularData = !isPregnant ? patient : null;
  
  // OPTIMIZATION 2: Only fetch purchases when on purchases tab
  const { data: purchases, isPending: purchasesLoading } = usePatientPurchases(
    patientId || '', 
    activeTab === 'purchases' // Only fetch when tab is active
  );

  // Fetch children for pregnant patients who have delivered
  const shouldFetchChildren = isPregnant && pregnantData?.actual_delivery_date;
  const { data: children, isPending: childrenLoading } = useMotherChildren(
    patientId || null,
    activeTab === 'info' && !!shouldFetchChildren
  );

  // OPTIMIZATION 3: Memoize badge style functions
  const getStatusBadge = useCallback((status: string) => {
    const styles = {
      active: 'bg-gray-100 text-black border-gray-200',
      inactive: 'bg-gray-50 text-gray-600 border-gray-200',
      converted: 'bg-gray-100 text-black border-gray-200'
    };
    return styles[status as keyof typeof styles] || styles.inactive;
  }, []);

  const getPaymentStatusBadge = useCallback((status: string) => {
    const styles = {
      paid: 'bg-gray-100 text-black border-gray-200',
      partial: 'bg-gray-100 text-black border-gray-200',
      unpaid: 'bg-gray-50 text-gray-600 border-gray-200'
    };
    return styles[status as keyof typeof styles] || styles.unpaid;
  }, []);

  const getPaymentStatus = useCallback((purchase: VaccinePurchase): string => {
    if (purchase.balance === 0) return 'paid';
    if (purchase.amount_paid > 0) return 'partial';
    return 'unpaid';
  }, []);

  // OPTIMIZATION 4: Memoize expensive calculations
  const { totalSpent, totalBalance, totalDoses } = useMemo(() => {
    if (!purchases) return { totalSpent: 0, totalBalance: 0, totalDoses: 0 };
    
    return {
      totalSpent: purchases.reduce((sum, p) => sum + Number(p.amount_paid), 0),
      totalBalance: purchases.reduce((sum, p) => sum + Number(p.balance), 0),
      totalDoses: purchases.reduce((sum, p) => sum + p.doses_administered, 0)
    };
  }, [purchases]);

  // OPTIMIZATION 5: Memoize handlers to prevent re-renders
  const handlePurchaseVaccine = useCallback(() => {
    if (patient) setPurchaseVaccinePatient(patient);
  }, [patient]);

  const handleEditPatient = useCallback(() => {
    navigate(`/patients/${patientId}/edit`);
  }, [navigate, patientId]);

  const handleBackToPatients = useCallback(() => {
    navigate('/patients');
  }, [navigate]);

  const handlePurchaseSuccess = useCallback(() => {
    setPurchaseVaccinePatient(null);
    setActiveTab('purchases');
  }, []);

  const togglePurchaseExpansion = useCallback((purchaseId: string) => {
    setExpandedPurchase(prev => prev === purchaseId ? null : purchaseId);
  }, []);

  if (isPending) {
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
          onClick={handleBackToPatients}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
        >
          Back to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-white p-8 border-b border-gray-200">
          <div className="flex items-start justify-between mb-8">
            <button
              onClick={handleBackToPatients}
              className="text-gray-600 hover:text-black transition-colors group"
              title="Back to Patients"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex gap-3">
              <button
                onClick={handlePurchaseVaccine}
                className="px-5 py-2.5 bg-black hover:bg-gray-900 text-white rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2"
              >
                <Syringe className="w-4 h-4" />
                Purchase Vaccine
              </button>
              <button
                onClick={handleEditPatient}
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
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-2 font-semibold text-sm transition-all relative ${activeTab === 'info'
                  ? 'text-black'
                  : 'text-gray-500 hover:text-black'
                }`}
            >
              Patient Information
              {activeTab === 'info' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`py-4 px-2 font-semibold text-sm transition-all relative ${activeTab === 'purchases'
                  ? 'text-black'
                  : 'text-gray-500 hover:text-black'
                }`}
            >
              Vaccine Purchases & History
              {activeTab === 'purchases' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <PatientInfoTab 
          patient={patient}
          isPregnant={isPregnant}
          pregnantData={pregnantData}
          regularData={regularData as RegularPatient}
          children={children}
          childrenLoading={childrenLoading}
          showAddChildForm={showAddChildForm}
          editingChildId={editingChildId}
          onToggleAddChild={() => setShowAddChildForm(!showAddChildForm)}
          onEditChild={(childId) => setEditingChildId(editingChildId === childId ? null : childId)}
          onChildActionComplete={() => {
            setShowAddChildForm(false);
            setEditingChildId(null);
          }}
          patientId={patientId || ''}
        />
      )}

      {activeTab === 'purchases' && (
        <PurchasesTab
          purchases={purchases}
          purchasesLoading={purchasesLoading}
          totalSpent={totalSpent}
          totalBalance={totalBalance}
          totalDoses={totalDoses}
          expandedPurchase={expandedPurchase}
          onTogglePurchase={togglePurchaseExpansion}
          getPaymentStatusBadge={getPaymentStatusBadge}
          getPaymentStatus={getPaymentStatus}
          onMakePayment={setPaymentPurchase}
          onAdministerDose={setAdministerPurchase}
        />
      )}

      <PurchaseVaccinePanel
        patient={purchaseVaccinePatient}
        onClose={() => setPurchaseVaccinePatient(null)}
        onSuccess={handlePurchaseSuccess}
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

// OPTIMIZATION 6: Split into smaller memoized components to reduce re-renders
const PatientInfoTab = React.memo<{
  patient: Patient;
  isPregnant: boolean;
  pregnantData: any;
  regularData: RegularPatient;
  children?: any[];
  childrenLoading: boolean;
  showAddChildForm: boolean;
  editingChildId: string | null;
  onToggleAddChild: () => void;
  onEditChild: (childId: string) => void;
  onChildActionComplete: () => void;
  patientId: string;
}>(({ 
  patient, 
  isPregnant, 
  pregnantData, 
  regularData, 
  children, 
  childrenLoading,
  showAddChildForm,
  editingChildId,
  onToggleAddChild,
  onEditChild,
  onChildActionComplete,
  patientId
}) => (
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
          value={isPregnant ? 'Female' : regularData?.sex === 'male' ? 'Male' : 'Female'}
        />
        <InfoRow label="Patient ID" value={patient.id} />
      </div>
    </div>

    {/* Pregnant-specific Information */}
    {isPregnant && pregnantData && (
      <>
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

        {/* Children Section - Only show if delivered */}
        {pregnantData.actual_delivery_date && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Baby className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">Children</h3>
                  <p className="text-sm text-gray-600">
                    {children?.length || 0} {children?.length === 1 ? 'child' : 'children'} registered
                  </p>
                </div>
              </div>
              <button
                onClick={onToggleAddChild}
                className={`px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 ${
                  showAddChildForm 
                    ? 'bg-gray-100 text-black border border-gray-300' 
                    : 'bg-black text-white hover:bg-gray-900'
                }`}
              >
                {showAddChildForm ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Child
                  </>
                )}
              </button>
            </div>

            {/* Add Child Form - Inline */}
            {showAddChildForm && (
              <InlineAddChildForm 
                motherId={patientId}
                onSuccess={onChildActionComplete}
              />
            )}

            {/* Children List */}
            {childrenLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : !children || children.length === 0 ? (
              !showAddChildForm && (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                  <Baby className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No children registered yet</p>
                  <p className="text-gray-400 text-xs mt-1">Click "Add Child" to register a child</p>
                </div>
              )
            ) : (
              <div className="space-y-3 mt-4">
                {children.map((child) => (
                  <ChildCard
                    key={child.id}
                    child={child}
                    isEditing={editingChildId === child.id}
                    onToggleEdit={() => onEditChild(child.id)}
                    onEditSuccess={onChildActionComplete}
                    motherId={patientId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </>
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
));

const PurchasesTab = React.memo<{
  purchases?: VaccinePurchase[];
  purchasesLoading: boolean;
  totalSpent: number;
  totalBalance: number;
  totalDoses: number;
  expandedPurchase: string | null;
  onTogglePurchase: (id: string) => void;
  getPaymentStatusBadge: (status: string) => string;
  getPaymentStatus: (purchase: VaccinePurchase) => string;
  onMakePayment: (purchase: VaccinePurchase) => void;
  onAdministerDose: (purchase: VaccinePurchase) => void;
}>(({ 
  purchases, 
  purchasesLoading, 
  totalSpent, 
  totalBalance, 
  totalDoses,
  expandedPurchase,
  onTogglePurchase,
  getPaymentStatusBadge,
  getPaymentStatus,
  onMakePayment,
  onAdministerDose
}) => (
  <div className="space-y-6">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-105">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-black" />
          </div>
        </div>
        <p className="text-sm font-medium text-gray-600 mb-1">Total Paid</p>
        <p className="text-3xl font-bold text-black">{formatCurrency(totalSpent)}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-105">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-black" />
          </div>
        </div>
        <p className="text-sm font-medium text-gray-600 mb-1">Outstanding Balance</p>
        <p className="text-3xl font-bold text-black">{formatCurrency(totalBalance)}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-105">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
            <Syringe className="w-6 h-6 text-black" />
          </div>
        </div>
        <p className="text-sm font-medium text-gray-600 mb-1">Doses Administered</p>
        <p className="text-3xl font-bold text-black">{totalDoses}</p>
      </div>
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
              onToggle={() => onTogglePurchase(purchase.id)}
              getPaymentStatusBadge={getPaymentStatusBadge}
              getPaymentStatus={getPaymentStatus}
              onMakePayment={() => onMakePayment(purchase)}
              onAdministerDose={() => onAdministerDose(purchase)}
            />
          ))}
        </div>
      )}
    </div>
  </div>
));

// OPTIMIZATION 7: Memoize individual purchase cards
const PurchaseCard = React.memo<{
  purchase: VaccinePurchase;
  isExpanded: boolean;
  onToggle: () => void;
  getPaymentStatusBadge: (status: string) => string;
  getPaymentStatus: (purchase: VaccinePurchase) => string;
  onMakePayment: () => void;
  onAdministerDose: () => void;
}>(({ purchase, isExpanded, onToggle, getPaymentStatusBadge, getPaymentStatus, onMakePayment, onAdministerDose }) => {
  const paymentStatus = getPaymentStatus(purchase);
  
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
              <span className={`px-2 py-1 text-xs font-semibold rounded-lg border ${getPaymentStatusBadge(paymentStatus)}`}>
                {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
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
});

// Helper component for displaying information rows
const InfoRow = React.memo<{
  label: string;
  value: string;
  isTextArea?: boolean;
}>(({ label, value, isTextArea = false }) => {
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
});

// Inline Add Child Form Component
const InlineAddChildForm: React.FC<{ motherId: string; onSuccess: () => void }> = ({ motherId, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    sex: '' as 'male' | 'female' | '',
    notes: '',
  });

  const createChildMutation = useCreateChild();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      date_of_birth: formData.date_of_birth,
    };

    if (formData.name.trim()) payload.name = formData.name.trim();
    if (formData.sex) payload.sex = formData.sex;
    if (formData.notes.trim()) payload.notes = formData.notes.trim();

    createChildMutation.mutate(
      { motherId, data: payload },
      {
        onSuccess: () => {
          onSuccess();
          setFormData({ name: '', date_of_birth: '', sex: '', notes: '' });
        },
      }
    );
  };

  return (
    <div className="mb-6 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
      <h4 className="font-bold text-black mb-4 flex items-center gap-2">
        <Baby className="w-5 h-5" />
        New Child Information
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Child's Name <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Sex <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <select
              value={formData.sex}
              onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Select sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Notes <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!formData.date_of_birth || createChildMutation.isPending}
            className="px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {createChildMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Child
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Child Card with Inline Edit Form
const ChildCard: React.FC<{
  child: any;
  isEditing: boolean;
  onToggleEdit: () => void;
  onEditSuccess: () => void;
  motherId: string;
}> = ({ child, isEditing, onToggleEdit, onEditSuccess, motherId }) => {
  const [formData, setFormData] = useState({
    name: child.name || '',
    sex: child.sex || '',
    six_month_checkup_date: child.six_month_checkup_date || '',
    six_month_checkup_completed: child.six_month_checkup_completed,
    hep_b_antibody_test_result: child.hep_b_antibody_test_result || '',
    test_date: child.test_date || '',
    notes: child.notes || '',
  });

  const updateChildMutation = useUpdateChild();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {};
    if (formData.name.trim()) payload.name = formData.name.trim();
    if (formData.sex) payload.sex = formData.sex;
    if (formData.six_month_checkup_date) payload.six_month_checkup_date = formData.six_month_checkup_date;
    payload.six_month_checkup_completed = formData.six_month_checkup_completed;
    if (formData.hep_b_antibody_test_result.trim()) 
      payload.hep_b_antibody_test_result = formData.hep_b_antibody_test_result.trim();
    if (formData.test_date) payload.test_date = formData.test_date;
    if (formData.notes.trim()) payload.notes = formData.notes.trim();

    updateChildMutation.mutate(
      { childId: child.id, motherId, data: payload },
      {
        onSuccess: () => {
          onEditSuccess();
        },
      }
    );
  };

  if (isEditing) {
    return (
      <div className="border-2 border-black rounded-xl p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-black flex items-center gap-2">
            <Baby className="w-5 h-5" />
            Edit Child Information
          </h4>
          <button
            onClick={onToggleEdit}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Child's Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">Sex</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">Select sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">6-Month Checkup Date</label>
              <input
                type="date"
                value={formData.six_month_checkup_date}
                onChange={(e) => setFormData({ ...formData, six_month_checkup_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">Hep B Test Result</label>
              <input
                type="text"
                value={formData.hep_b_antibody_test_result}
                onChange={(e) => setFormData({ ...formData, hep_b_antibody_test_result: e.target.value })}
                placeholder="Test result"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">Test Date</label>
              <input
                type="date"
                value={formData.test_date}
                onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id={`checkup-${child.id}`}
              checked={formData.six_month_checkup_completed}
              onChange={(e) => setFormData({ ...formData, six_month_checkup_completed: e.target.checked })}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-2 focus:ring-black"
            />
            <label htmlFor={`checkup-${child.id}`} className="text-sm font-medium text-black">
              6-Month Checkup Completed
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onToggleEdit}
              className="px-4 py-2 border border-gray-300 text-black rounded-lg font-medium hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateChildMutation.isPending}
              className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50 flex items-center gap-2"
            >
              {updateChildMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all hover:shadow-sm cursor-pointer"
      onClick={onToggleEdit}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-bold text-black">
              {child.name || 'Unnamed Child'}
            </h4>
            <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-black border border-gray-200">
              {child.sex === 'male' ? 'Male' : child.sex === 'female' ? 'Female' : 'Not specified'}
            </span>
            {child.six_month_checkup_completed && (
              <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-green-100 text-green-800 border border-green-200">
                ✓ 6-Month Checkup
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Date of Birth:</span>
              <span className="ml-2 font-semibold text-black">
                {formatDate(child.date_of_birth)}
              </span>
            </div>
            {child.six_month_checkup_date && (
              <div>
                <span className="text-gray-600">6-Month Checkup:</span>
                <span className="ml-2 font-semibold text-black">
                  {formatDate(child.six_month_checkup_date)}
                </span>
              </div>
            )}
            {child.hep_b_antibody_test_result && (
              <div>
                <span className="text-gray-600">Hep B Test:</span>
                <span className="ml-2 font-semibold text-black">
                  {child.hep_b_antibody_test_result}
                </span>
              </div>
            )}
            {child.test_date && (
              <div>
                <span className="text-gray-600">Test Date:</span>
                <span className="ml-2 font-semibold text-black">
                  {formatDate(child.test_date)}
                </span>
              </div>
            )}
          </div>
          {child.notes && (
            <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
              {child.notes}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Edit3 className="w-4 h-4 text-gray-400" />
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};