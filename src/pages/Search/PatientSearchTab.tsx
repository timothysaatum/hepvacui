import React, { useState } from 'react';
import { Users, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { usePatientSearch } from '../../hooks/useSearch';
import type { PatientSearchFilters } from '../../types/search';
import { SearchFilters } from '../../components/search/SearchFilters';
import { PatientSearchCard } from '../../components/search/PatientSearchCard';
// import { useAuth } from '../../context/AuthContext';
import { useAuth } from '../../context/useAuth'


const FILTER_FIELDS = [
    { name: 'name', label: 'Patient Name', type: 'text' as const, placeholder: 'Search by name...' },
    { name: 'phone', label: 'Phone Number', type: 'text' as const, placeholder: 'Search by phone...' },
    {
        name: 'patient_type',
        label: 'Patient Type',
        type: 'select' as const,
        options: [
            { value: 'pregnant', label: 'Pregnant' },
            { value: 'regular', label: 'Regular' },
        ],
    },
    {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'converted', label: 'Converted' },
            { value: 'postpartum', label: 'Postpartum' },
            { value: 'completed', label: 'Completed' },
        ],
    },
    {
        name: 'sex',
        label: 'Sex',
        type: 'select' as const,
        options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
        ],
    },
    { name: 'age_min', label: 'Min Age', type: 'number' as const, placeholder: '0' },
    { name: 'age_max', label: 'Max Age', type: 'number' as const, placeholder: '150' },
    { name: 'created_from', label: 'Created From', type: 'date' as const },
    { name: 'created_to', label: 'Created To', type: 'date' as const },
];

export const PatientSearchTab: React.FC = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState<PatientSearchFilters>({
        page: 1,
        page_size: 10,
        facility_id: user?.facility?.id,
    });

    const [searchTrigger, setSearchTrigger] = useState(0);

    const { data, isFetching, error } = usePatientSearch(filters, searchTrigger > 0);

    const handleFilterChange = <K extends keyof PatientSearchFilters>(
      name: K,
      value: PatientSearchFilters[K]
    ) => {
      setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
    };

    const handleClearFilters = () => {
        setFilters({
            page: 1,
            page_size: 10,
            facility_id: user?.facility?.id,
        });
        setSearchTrigger(0);
    };

    const handleSearch = () => {
        setSearchTrigger((prev) => prev + 1);
    };

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
        setSearchTrigger((prev) => prev + 1);
    };

    return (
        <div>
            <SearchFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                onSearch={handleSearch}
                fields={FILTER_FIELDS}
                isPending={isFetching}
            />

            {/* Results */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-red-900 mb-1">Search Error</h3>
                        <p className="text-sm text-red-700">
                            {error instanceof Error ? error.message : 'Failed to search patients. Please try again.'}
                        </p>
                    </div>
                </div>
            )}

            {searchTrigger === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">Search for Patients</h3>
                    <p className="text-gray-600">
                        Use the filters above to search for patients. Leave filters empty to view recent patients.
                    </p>
                </div>
            )}

            {searchTrigger > 0 && !isFetching && !error && data && (
                <>
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-black">Search Results</h3>
                                <p className="text-sm text-gray-600">
                                    {data.total_count} patient{data.total_count !== 1 ? 's' : ''} found
                                    {data.query_time_ms && ` in ${data.query_time_ms}ms`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Results Grid */}
                    {data.items.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-black mb-2">No Patients Found</h3>
                            <p className="text-gray-600">Try adjusting your search filters.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                                {data.items.map((patient) => (
                                    <PatientSearchCard key={patient.id} patient={patient} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {data.total_pages > 1 && (
                                <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="text-sm text-gray-600">
                                        Page {data.page} of {data.total_pages}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(data.page - 1)}
                                            disabled={!data.has_previous}
                                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(data.page + 1)}
                                            disabled={!data.has_next}
                                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};