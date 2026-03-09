import React, { useState } from 'react';
import { Users, ChevronLeft, ChevronRight, AlertCircle, ChevronRight as ArrowRight } from 'lucide-react';
import { usePatientSearch } from '../../hooks/useSearch';
import type { PatientSearchFilters } from '../../types/search';
import { SearchFilters } from '../../components/search/SearchFilters';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';

const FILTER_FIELDS = [
    { name: 'name', label: 'Patient Name', type: 'text' as const, placeholder: 'Search by name...' },
    { name: 'phone', label: 'Phone Number', type: 'text' as const, placeholder: 'Search by phone...' },
    {
        name: 'patient_type', label: 'Patient Type', type: 'select' as const, options: [
            { value: 'pregnant', label: 'Pregnant' },
            { value: 'regular', label: 'Regular' },
        ]
    },
    {
        name: 'status', label: 'Status', type: 'select' as const, options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'converted', label: 'Converted' },
            { value: 'postpartum', label: 'Postpartum' },
            { value: 'completed', label: 'Completed' },
        ]
    },
    {
        name: 'sex', label: 'Sex', type: 'select' as const, options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
        ]
    },
    { name: 'age_min', label: 'Min Age', type: 'number' as const, placeholder: '0' },
    { name: 'age_max', label: 'Max Age', type: 'number' as const, placeholder: '150' },
    { name: 'created_from', label: 'Created From', type: 'date' as const },
    { name: 'created_to', label: 'Created To', type: 'date' as const },
];

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-slate-100 text-slate-600',
    postpartum: 'bg-purple-100 text-purple-700',
    completed: 'bg-blue-100 text-blue-700',
    converted: 'bg-amber-100 text-amber-700',
};

export const PatientSearchTab: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [filters, setFilters] = useState<PatientSearchFilters>({
        page: 1, page_size: 10, facility_id: user?.facility?.id,
    });
    const [searchTrigger, setSearchTrigger] = useState(0);
    const { data, isFetching, error } = usePatientSearch(filters, searchTrigger > 0);

    const handleFilterChange = <K extends keyof PatientSearchFilters>(name: K, value: PatientSearchFilters[K]) =>
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));

    const handleClearFilters = () => {
        setFilters({ page: 1, page_size: 10, facility_id: user?.facility?.id });
        setSearchTrigger(0);
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
        setSearchTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-4">
            <SearchFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                onSearch={() => setSearchTrigger(prev => prev + 1)}
                fields={FILTER_FIELDS}
                isPending={isFetching}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">
                        {error instanceof Error ? error.message : 'Failed to search patients.'}
                    </p>
                </div>
            )}

            {searchTrigger === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-700 mb-1">Search for Patients</h3>
                    <p className="text-sm text-gray-500">Use the filters above to search patient records.</p>
                </div>
            )}

            {searchTrigger > 0 && !isFetching && !error && data && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Table header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                        <span className="text-sm font-semibold text-gray-700">
                            {data.total_count} patient{data.total_count !== 1 ? 's' : ''} found
                            {data.query_time_ms ? ` · ${data.query_time_ms}ms` : ''}
                        </span>
                    </div>

                    {data.items.length === 0 ? (
                        <div className="py-12 text-center text-sm text-gray-500">No patients match your filters.</div>
                    ) : (
                        <>
                            {/* Column headers */}
                            <div className="grid grid-cols-12 gap-4 px-5 py-2.5 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                <div className="col-span-4">Patient</div>
                                <div className="col-span-2">Phone</div>
                                <div className="col-span-1">Age</div>
                                <div className="col-span-2">Type</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-1"></div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-gray-50">
                                {data.items.map((patient: any) => (
                                    <button
                                        key={patient.id}
                                        onClick={() => navigate(`/patients/${patient.id}`)}
                                        className="w-full grid grid-cols-12 gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left items-center"
                                    >
                                        <div className="col-span-4 flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {patient.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 truncate">{patient.name}</span>
                                        </div>
                                        <div className="col-span-2 text-sm text-gray-600">{patient.phone}</div>
                                        <div className="col-span-1 text-sm text-gray-600">{patient.age ?? '—'}</div>
                                        <div className="col-span-2">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${patient.patient_type === 'pregnant'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {patient.patient_type === 'pregnant' ? 'Pregnant' : 'Regular'}
                                            </span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[patient.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {patient.status}
                                            </span>
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Pagination */}
                            {data.total_pages > 1 && (
                                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                                    <span className="text-xs text-gray-500">Page {data.page} of {data.total_pages}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(data.page - 1)}
                                            disabled={!data.has_previous}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-3 h-3" /> Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(data.page + 1)}
                                            disabled={!data.has_next}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};