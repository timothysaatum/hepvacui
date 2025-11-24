import React, { useEffect } from 'react';
import type { Vaccine } from '../../types/vaccine';
import { useVaccineStock } from '../../hooks/useVaccines';
import { formatNumber, formatCurrency } from '../../utils/formatters';

interface StockInfoModalProps {
  vaccine: Vaccine;
  onClose: () => void;
}

export const StockInfoModal: React.FC<StockInfoModalProps> = ({ vaccine, onClose }) => {
  const { data: stockInfo, isLoading, error } = useVaccineStock(vaccine.id);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Stock Information</h2>
            <p className="text-sm text-gray-600 mt-1">{vaccine.vaccine_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full text-2xl font-bold w-10 h-10 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-500">Loading stock information...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
              <div className="flex items-center">
                <span className="text-xl mr-2">⚠️</span>
                <span>Failed to load stock information</span>
              </div>
            </div>
          ) : stockInfo ? (
            <div className="space-y-4">
              {/* Stock Status Card */}
              <div className={`border-2 rounded-lg p-4 ${
                stockInfo.is_low_stock 
                  ? 'bg-yellow-50 border-yellow-300' 
                  : 'bg-green-50 border-green-300'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Stock Status:</span>
                  <span className={`text-lg font-bold ${
                    stockInfo.is_low_stock ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {stockInfo.is_low_stock ? '⚠️ Low Stock' : '✓ Good Stock'}
                  </span>
                </div>
              </div>

              {/* Stock Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Total Quantity</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(stockInfo.quantity)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">units</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Available</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(stockInfo.available_quantity)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">units</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Reserved</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatNumber(stockInfo.reserved_quantity)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">units</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Total Value</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(vaccine.price_per_dose * stockInfo.quantity)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">at {formatCurrency(vaccine.price_per_dose)}/dose</div>
                </div>
              </div>

              {/* Batch Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Batch Information</div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Batch Number:</span> {stockInfo.batch_number}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};