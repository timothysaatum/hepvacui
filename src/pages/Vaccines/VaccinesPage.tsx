import React, { useState } from 'react';
import type { Vaccine } from '../../types/vaccine';
import { VaccineList } from '../../components/vaccines/VaccineList';
import { CreateVaccineForm } from '../../components/vaccines/CreateVaccineForm';
import { EditVaccineForm } from '../../components/vaccines/EditVaccineForm';
import { AddStockModal } from '../../components/vaccines/AddStockModal';
import { StockInfoModal } from '../../components/vaccines/StockInfoModal';
import { Plus, ArrowLeft } from 'lucide-react';

type ViewMode = 'list' | 'create' | 'edit';

export const VaccinesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [stockModalVaccine, setStockModalVaccine] = useState<Vaccine | null>(null);
  const [addStockModalVaccine, setAddStockModalVaccine] = useState<Vaccine | null>(null);

  const handleSuccess = () => { setViewMode('list'); setSelectedVaccine(null); };
  const handleCancel = () => { setViewMode('list'); setSelectedVaccine(null); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {viewMode === 'list' && 'Vaccines'}
            {viewMode === 'create' && 'Add New Vaccine'}
            {viewMode === 'edit' && 'Edit Vaccine'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {viewMode === 'list' && 'Manage vaccine stock, pricing and availability'}
            {viewMode === 'create' && 'Register a new vaccine in the inventory'}
            {viewMode === 'edit' && 'Update vaccine details and pricing'}
          </p>
        </div>

        {viewMode === 'list' && (
          <button
            onClick={() => { setViewMode('create'); setSelectedVaccine(null); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Vaccine
          </button>
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inventory
          </button>
        )}
      </div>

      {/* Content */}
      {viewMode === 'list' && (
        <VaccineList
          onEdit={v => { setSelectedVaccine(v); setViewMode('edit'); }}
          onViewStock={v => setStockModalVaccine(v)}
          onAddStock={v => setAddStockModalVaccine(v)}
        />
      )}

      {viewMode === 'create' && (
        <CreateVaccineForm onSuccess={handleSuccess} onCancel={handleCancel} />
      )}

      {viewMode === 'edit' && selectedVaccine && (
        <EditVaccineForm
          vaccineId={selectedVaccine.id}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      {/* Modals */}
      {stockModalVaccine && (
        <StockInfoModal vaccine={stockModalVaccine} onClose={() => setStockModalVaccine(null)} />
      )}
      {addStockModalVaccine && (
        <AddStockModal
          vaccine={addStockModalVaccine}
          onClose={() => setAddStockModalVaccine(null)}
          onSuccess={() => setAddStockModalVaccine(null)}
        />
      )}
    </div>
  );
};