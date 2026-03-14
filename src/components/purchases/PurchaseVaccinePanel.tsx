import React, { useState } from 'react';
import type { Patient } from '../../types/patient';
import type { Vaccine } from '../../types/vaccine';
import { useVaccines } from '../../hooks/useVaccines';
import { useCreateVaccinePurchase } from '../../hooks/useVaccinePurchases';
import { formatCurrency } from '../../utils/formatters';
import { SlideOverPanel } from './SlideOverPanel';

interface PurchaseVaccinePanelProps {
  patient: Patient | null;
  onClose: () => void;
  onSuccess?: () => void;
}

// ── Searchable Vaccine Picker ─────────────────────────────────────────────────

function VaccinePicker({
  vaccines,
  selected,
  onSelect,
}: {
  vaccines: Vaccine[];
  selected: Vaccine | null;
  onSelect: (v: Vaccine | null) => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = vaccines.filter(v =>
    v.vaccine_name.toLowerCase().includes(query.toLowerCase()) ||
    v.batch_number?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Search by name or batch…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
      />

      <div className="border border-gray-200 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-400">No vaccines found</div>
        ) : (
          filtered.map(v => {
            const inStock = (v.quantity ?? 0) > 0;
            const isSelected = selected?.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                disabled={!inStock}
                onClick={() => onSelect(v)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors border-b border-gray-100 last:border-0
                  ${isSelected
                    ? 'bg-purple-50'
                    : inStock
                      ? 'hover:bg-gray-50'
                      : 'opacity-40 cursor-not-allowed bg-gray-50'
                  }`}
              >
                <div className="min-w-0">
                  <p className={`font-medium truncate ${isSelected ? 'text-purple-800' : 'text-gray-900'}`}>
                    {v.vaccine_name}
                  </p>
                  {v.batch_number && (
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{v.batch_number}</p>
                  )}
                </div>
                <div className="shrink-0 text-right ml-4 space-y-0.5">
                  <p className={`text-sm font-semibold ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>
                    {formatCurrency(v.price_per_dose)}<span className="font-normal text-xs text-gray-400">/dose</span>
                  </p>
                  <p className={`text-xs font-medium ${!inStock ? 'text-red-500' : (v.quantity ?? 0) < 50 ? 'text-amber-600' : 'text-green-600'
                    }`}>
                    {inStock ? `${v.quantity} in stock` : 'Out of stock'}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {selected && (
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>Selected: <span className="font-medium text-gray-700">{selected.vaccine_name}</span></span>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export const PurchaseVaccinePanel: React.FC<PurchaseVaccinePanelProps> = ({
  patient,
  onClose,
  onSuccess,
}) => {
  const createPurchaseMutation = useCreateVaccinePurchase();
  const { data: vaccinesData } = useVaccines(1, 100, true);

  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [totalDoses, setTotalDoses] = useState(3);
  const [error, setError] = useState('');

  const vaccines = vaccinesData?.items ?? [];
  const totalPrice = (selectedVaccine?.price_per_dose ?? 0) * totalDoses;
  const isBusy = createPurchaseMutation.isPending;

  const handleClose = () => {
    setSelectedVaccine(null);
    setTotalDoses(3);
    setError('');
    onClose();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    if (!selectedVaccine) { setError('Please select a vaccine.'); return; }
    if (totalDoses < 1) { setError('Doses must be at least 1.'); return; }
    setError('');

    try {
      await createPurchaseMutation.mutateAsync({
        patientId: patient.id,
        data: { vaccine_id: selectedVaccine.id, total_doses: totalDoses },
      });
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create purchase. Please try again.');
    }
  };

  if (!patient) return null;

  return (
    <SlideOverPanel
      isOpen={!!patient}
      onClose={handleClose}
      title="Purchase Vaccine"
      subtitle={patient.name}
      width="lg"
    >
      <form onSubmit={onSubmit} className="p-6 space-y-5">
        {/* Info notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-xl">💉</span>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Vaccine Purchase</p>
            <p>Select a vaccine and number of doses. Payments can be made in installments.</p>
          </div>
        </div>

        {/* Vaccine picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Vaccine <span className="text-red-500">*</span>
          </label>
          <VaccinePicker
            vaccines={vaccines}
            selected={selectedVaccine}
            onSelect={setSelectedVaccine}
          />
        </div>

        {/* Total Doses */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Doses <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={totalDoses}
            onChange={e => setTotalDoses(parseInt(e.target.value, 10) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Price summary */}
        {selectedVaccine && totalDoses > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Price per dose</span>
              <span className="font-medium text-gray-900">{formatCurrency(selectedVaccine.price_per_dose)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Number of doses</span>
              <span className="font-medium text-gray-900">{totalDoses}</span>
            </div>
            <div className="flex justify-between border-t border-green-300 pt-2">
              <span className="font-medium text-gray-700">Total Package Price</span>
              <span className="text-lg font-bold text-green-600">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            Doses will be administered based on the amount paid. Full payment is not required upfront.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isBusy}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isBusy ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating…
              </span>
            ) : (
              'Purchase Vaccine'
            )}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={isBusy}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </SlideOverPanel>
  );
};