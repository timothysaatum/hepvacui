import React from 'react';
import type { VaccinePurchase } from '../../types/vaccinePurchase';
import { usePatientPurchases } from '../../hooks/useVaccinePurchases';
import { formatCurrency } from '../../utils/formatters';
import { ExpandablePurchaseCard } from '../purchases/ExpandablePurchaseCard';

interface PatientPurchaseListProps {
  patientId: string;
  onViewDetails?: (purchaseId: string) => void; // Keep for backward compatibility but won't be used
  onMakePayment?: (purchase: VaccinePurchase) => void;
  onAdministerDose?: (purchase: VaccinePurchase) => void;
}

export const PatientPurchaseList: React.FC<PatientPurchaseListProps> = ({ 
  patientId,
  // onViewDetails is no longer needed - cards expand inline
  onMakePayment,
  onAdministerDose,
}) => {
  const { data: purchases, isLoading, error } = usePatientPurchases(patientId, false);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-500">Loading purchases...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        <div className="flex items-center">
          <span className="text-xl mr-2">⚠️</span>
          <span>Failed to load vaccine purchases. Please try again.</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!purchases || purchases.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">💉</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Vaccine Purchases</h3>
        <p className="text-gray-500">
          This patient hasn't purchased any vaccines yet.
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalSpent = purchases.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const totalBalance = purchases.reduce((sum, p) => sum + Number(p.balance), 0);
  const totalDosesReceived = purchases.reduce((sum, p) => sum + p.doses_administered, 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Total Paid</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Total Balance</p>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(totalBalance)}</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Doses Received</p>
              <p className="text-2xl font-bold text-blue-900">{totalDosesReceived}</p>
            </div>
            <div className="text-3xl">💉</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase History</h3>
        <div className="space-y-3">
          {purchases.map((purchase) => (
            <ExpandablePurchaseCard
              key={purchase.id}
              purchaseId={purchase.id}
              onMakePayment={onMakePayment}
              onAdministerDose={onAdministerDose}
            />
          ))}
        </div>
      </div>
    </div>
  );
};