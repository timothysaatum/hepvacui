import React, { useState } from 'react';
import { FacilityList } from '../../components/facilities/FacilityList';
import { CreateFacilityForm } from '../../components/facilities/CreateFacilityForm';
import { EditFacilityForm } from '../../components/facilities/EditFacilityForm';
import { FacilityStaffModal } from '../../components/facilities/FacilityStaffModal';
import type { Facility } from '../../types/facility';

export const FacilitiesPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);
  const [viewingStaffFacility, setViewingStaffFacility] = useState<Facility | null>(null);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    // No need for refreshKey - React Query handles cache invalidation
  };

  const handleEditSuccess = () => {
    setEditingFacilityId(null);
    // No need for refreshKey - React Query handles cache invalidation
  };

  const handleEdit = (facility: Facility) => {
    setEditingFacilityId(facility.id);
    setShowCreateForm(false);
  };

  const handleViewStaff = (facility: Facility) => {
    setViewingStaffFacility(facility);
  };

  const handleCloseStaffModal = () => {
    setViewingStaffFacility(null);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facility Management</h1>
          {/* <p className="text-sm text-gray-600 mt-1">Manage healthcare facilities and their staff</p> */}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setEditingFacilityId(null);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-medium transition-colors"
          >
            {showCreateForm ? '✕ Cancel' : '+ Add Facility'}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="mb-6">
          <CreateFacilityForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {editingFacilityId && (
        <div className="mb-6">
          <EditFacilityForm
            facilityId={editingFacilityId}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingFacilityId(null)}
          />
        </div>
      )}

      <FacilityList 
        onEdit={handleEdit}
        onViewStaff={handleViewStaff}
      />

      {/* Staff Modal */}
      {viewingStaffFacility && (
        <FacilityStaffModal
          facility={viewingStaffFacility}
          onClose={handleCloseStaffModal}
        />
      )}
    </div>
  );
};