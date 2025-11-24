import React, { useState } from 'react';
import type { Vaccine } from '../../types/vaccine';
import { VaccineList } from '../../components/vaccines/VaccineList';
import { CreateVaccineForm } from '../../components/vaccines/CreateVaccineForm';
import { EditVaccineForm } from '../../components/vaccines/EditVaccineForm';
import { AddStockModal } from '../../components/vaccines/AddStockModal';
import { StockInfoModal } from '../../components/vaccines/StockInfoModal';

// This component manages the entire vaccine inventory workflow

type ViewMode = 'list' | 'create' | 'edit';

export const VaccinesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [stockModalVaccine, setStockModalVaccine] = useState<Vaccine | null>(null);
  const [addStockModalVaccine, setAddStockModalVaccine] = useState<Vaccine | null>(null);

  // Handle creating new vaccine
  const handleCreateClick = () => {
    setViewMode('create');
    setSelectedVaccine(null);
  };

  // Handle editing vaccine
  const handleEdit = (vaccine: Vaccine) => {
    setSelectedVaccine(vaccine);
    setViewMode('edit');
  };

  // Handle viewing stock info
  const handleViewStock = (vaccine: Vaccine) => {
    setStockModalVaccine(vaccine);
  };

  // Handle adding stock
  const handleAddStock = (vaccine: Vaccine) => {
    setAddStockModalVaccine(vaccine);
  };

  // Handle success actions
  const handleSuccess = () => {
    setViewMode('list');
    setSelectedVaccine(null);
  };

  // Handle cancel actions
  const handleCancel = () => {
    setViewMode('list');
    setSelectedVaccine(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vaccines</h1>
          {/* <p className="text-gray-600 mt-1">
            Manage vaccine inventory and stock levels
          </p> */}
        </div>

        {viewMode === 'list' && (
          <button
            onClick={handleCreateClick}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Vaccine
          </button>
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors font-medium"
          >
            ← Back to List
          </button>
        )}
      </div>

      {/* Content */}
      {viewMode === 'list' && (
        <VaccineList
          onEdit={handleEdit}
          onViewStock={handleViewStock}
          onAddStock={handleAddStock}
        />
      )}

      {viewMode === 'create' && (
        <CreateVaccineForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
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
        <StockInfoModal
          vaccine={stockModalVaccine}
          onClose={() => setStockModalVaccine(null)}
        />
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