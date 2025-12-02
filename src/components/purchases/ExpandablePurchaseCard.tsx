import React, { useState } from 'react';
import type { VaccinePurchase } from '../../types/vaccinePurchase';
import { 
  useVaccinePurchase, 
  usePurchasePayments, 
  usePurchaseVaccinations 
} from '../../hooks/useVaccinePurchases';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ExpandablePurchaseCardProps {
  purchaseId: string;
  onMakePayment?: (purchase: VaccinePurchase) => void;
  onAdministerDose?: (purchase: VaccinePurchase) => void;
}

export const ExpandablePurchaseCard: React.FC<ExpandablePurchaseCardProps> = ({ 
  purchaseId, 
  onMakePayment,
  onAdministerDose,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'vaccinations'>('overview');

  const { data: purchase, isPending: purchaseLoading } = useVaccinePurchase(purchaseId);
  const { data: payments, isPending: paymentsLoading } = usePurchasePayments(purchaseId);
  const { data: vaccinations, isPending: vaccinationsLoading } = usePurchaseVaccinations(purchaseId);

  const getPaymentStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return { text: 'Completed', className: 'bg-green-100 text-green-800' };
      case 'partial':
        return { text: 'Partial', className: 'bg-yellow-100 text-yellow-800' };
      case 'pending':
        return { text: 'Pending', className: 'bg-red-100 text-red-800' };
      default:
        return { text: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const getDoseLabel = (doseNumber: string) => {
    return doseNumber;
  };

  if (purchaseLoading || !purchase) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const statusDisplay = getPaymentStatusDisplay(purchase.payment_status);
  const percentagePaid = (purchase.amount_paid / purchase.total_package_price) * 100;

  return (
    <div className={`border rounded-lg transition-all ${
      isExpanded ? 'border-purple-300 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
    }`}>
      {/* Collapsed View */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{purchase.vaccine_name}</h3>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusDisplay.className}`}>
                {statusDisplay.text}
              </span>
            </div>
            
            {!isExpanded && (
              <div className="flex gap-4 text-sm text-gray-600">
                <span>💉 {purchase.doses_administered}/{purchase.total_doses} doses</span>
                <span>💰 {formatCurrency(purchase.amount_paid)}/{formatCurrency(purchase.total_package_price)} paid</span>
                <span className="text-gray-400">•</span>
                <span>{formatDate(purchase.purchase_date)}</span>
              </div>
            )}
          </div>
        </div>

        {!isExpanded && (
          <div className="flex gap-2">
            {purchase.balance > 0 && onMakePayment && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMakePayment(purchase);
                }}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                Pay
              </button>
            )}
            {purchase.doses_administered < purchase.total_doses && onAdministerDose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdministerDose(purchase);
                }}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Administer
              </button>
            )}
          </div>
        )}
      </button>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'payments'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Payments ({payments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('vaccinations')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'vaccinations'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Vaccinations ({vaccinations?.length || 0})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Payment Progress */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Progress</h4>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{percentagePaid.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(percentagePaid, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total</p>
                      <p className="font-bold text-gray-900">{formatCurrency(purchase.total_package_price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Paid</p>
                      <p className="font-bold text-green-600">{formatCurrency(purchase.amount_paid)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Balance</p>
                      <p className="font-bold text-red-600">{formatCurrency(purchase.balance)}</p>
                    </div>
                  </div>
                </div>

                {/* Vaccination Progress */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Vaccination Progress</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Administered</p>
                        <p className="text-xl font-bold text-blue-600">
                          {purchase.doses_administered} / {purchase.total_doses}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Remaining</p>
                        <p className="text-xl font-bold text-orange-600">
                          {purchase.total_doses - purchase.doses_administered}
                        </p>
                      </div>
                    </div>
                    <div className="text-3xl">💉</div>
                  </div>
                </div>

                {/* Purchase Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoItem label="Batch Number" value={purchase.batch_number} />
                  <InfoItem label="Price/Dose" value={formatCurrency(purchase.price_per_dose)} />
                  <InfoItem label="Purchase Date" value={formatDate(purchase.purchase_date)} />
                  <InfoItem label="Purchase ID" value={purchase.id} />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  {purchase.balance > 0 && onMakePayment && (
                    <button
                      onClick={() => onMakePayment(purchase)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                    >
                      💳 Make Payment
                    </button>
                  )}
                  {purchase.doses_administered < purchase.total_doses && onAdministerDose && (
                    <button
                      onClick={() => onAdministerDose(purchase)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                    >
                      💉 Administer Dose
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                {paymentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </div>
                ) : payments && payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(payment.payment_date)}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {payment.payment_method}
                          </span>
                        </div>
                        {payment.reference_number && (
                          <p className="text-xs text-gray-600">Ref: {payment.reference_number}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-3xl mb-2">💳</p>
                    <p className="text-sm">No payments recorded yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Vaccinations Tab */}
            {activeTab === 'vaccinations' && (
              <div>
                {vaccinationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </div>
                ) : vaccinations && vaccinations.length > 0 ? (
                  <div className="space-y-3">
                    {vaccinations.map((vaccination) => (
                      <div
                        key={vaccination.id}
                        className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {getDoseLabel(vaccination.dose_number)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(vaccination.dose_date)}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            Administered
                          </span>
                        </div>
                        {vaccination.notes && (
                          <p className="text-xs text-gray-600 italic">{vaccination.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-3xl mb-2">💉</p>
                    <p className="text-sm">No vaccinations administered yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component
const InfoItem: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => {
  return (
    <div>
      <dt className="text-xs text-gray-500 mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-900 font-medium truncate">{value}</dd>
    </div>
  );
};