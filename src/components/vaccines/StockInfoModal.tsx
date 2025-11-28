import React, { useEffect } from 'react';
import type { Vaccine } from '../../types/vaccine';
import { useVaccineStock } from '../../hooks/useVaccines';
import { formatNumber, formatCurrency } from '../../utils/formatters';
import {
  X,
  Package,
  CheckCircle2,
  AlertTriangle,
  Lock,
  DollarSign,
  Loader2
} from 'lucide-react';

interface StockInfoModalProps {
  vaccine: Vaccine;
  onClose: () => void;
}

export const StockInfoModal: React.FC<StockInfoModalProps> = ({ vaccine, onClose }) => {
  const { data: stockInfo, isLoading, error } = useVaccineStock(vaccine.id);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Stock Information</h2>
              <p className="text-sm text-gray-600">{vaccine.vaccine_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
              <p className="text-sm text-gray-500 font-medium">Loading stock information...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-900">Failed to load stock information</h3>
                  <p className="text-sm text-red-700 mt-0.5">Please try again later</p>
                </div>
              </div>
            </div>
          ) : stockInfo ? (
            <div className="space-y-4">
              {/* Stock Status Card */}
              <div className={`border-2 rounded-lg p-4 ${stockInfo.is_low_stock
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-green-50 border-green-300'
                }`}>
                <div className="flex items-center gap-3">
                  {stockInfo.is_low_stock ? (
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">Stock Status</div>
                    <div className={`text-lg font-bold ${stockInfo.is_low_stock ? 'text-amber-700' : 'text-green-700'
                      }`}>
                      {stockInfo.is_low_stock ? 'Low Stock Alert' : 'Stock Level Good'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <Package className="w-3.5 h-3.5" />
                    Total Quantity
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(stockInfo.quantity)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">units</div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    Available
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(stockInfo.available_quantity)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">units</div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <Lock className="w-3.5 h-3.5 text-orange-600" />
                    Reserved
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatNumber(stockInfo.reserved_quantity)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">units</div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                    Total Value
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(vaccine.price_per_dose * stockInfo.quantity)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    @ {formatCurrency(vaccine.price_per_dose)}/dose
                  </div>
                </div>
              </div>

              {/* Batch Information */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  Batch Information
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Batch Number:</span>{' '}
                  <span className="font-mono">{stockInfo.batch_number}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};