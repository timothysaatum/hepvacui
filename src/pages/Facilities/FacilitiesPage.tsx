import React, { useState } from 'react';
import { FacilityList } from '../../components/facilities/FacilityList';
import { CreateFacilityForm } from '../../components/facilities/CreateFacilityForm';
import { EditFacilityForm } from '../../components/facilities/EditFacilityForm';
import type { Facility } from '../../types/facility';
import { Plus, X } from 'lucide-react';
export const FacilitiesPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
  };

  const handleEditSuccess = () => {
    setEditingFacilityId(null);
  };

  const handleEdit = (facility: Facility) => {
    setEditingFacilityId(facility.id);
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showCreateForm ? 'Add New Facility' : editingFacilityId ? 'Edit Facility' : 'Facility Management'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {showCreateForm ? 'Create a new healthcare facility' : editingFacilityId ? 'Update facility information' : 'Manage healthcare facilities and their staff'}
          </p>
        </div>

        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingFacilityId(null);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium transition-all shadow-sm ${showCreateForm
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
              : 'bg-black text-white hover:bg-gray-900 focus:ring-black hover:scale-105'
            }`}
        >
          {showCreateForm ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Facility
            </>
          )}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <CreateFacilityForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit Form */}
      {editingFacilityId && (
        <EditFacilityForm
          facilityId={editingFacilityId}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingFacilityId(null)}
        />
      )}

      {/* Facility List - Only show when not creating or editing */}
      {!showCreateForm && !editingFacilityId && (
        <FacilityList
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};