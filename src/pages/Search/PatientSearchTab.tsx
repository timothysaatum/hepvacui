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
    active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    inactive: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200',
    postpartum: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
    completed: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    converted: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
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
        <div className="space-y-3">
            <SearchFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                onSearch={() => setSearchTrigger(prev => prev + 1)}
                fields={FILTER_FIELDS}
                isPending={isFetching}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-700">
                        {error instanceof Error ? error.message : 'Failed to search patients.'}
                    </p>
                </div>
            )}

            {searchTrigger === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mb-2.5">
                        <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Search for Patients</p>
                    <p className="text-xs text-slate-400 mt-0.5">Apply filters above and click Search</p>
                </div>
            )}

            {searchTrigger > 0 && !isFetching && !error && data && (
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                    {/* Meta bar */}
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                        <span className="text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">{data.total_count}</span>{' '}
                            patient{data.total_count !== 1 ? 's' : ''} found
                            {data.query_time_ms ? (
                                <span className="text-slate-400 ml-1">· {data.query_time_ms}ms</span>
                            ) : null}
                        </span>
                        {data.total_pages > 1 && (
                            <span className="text-xs text-slate-400">
                                Page {data.page} of {data.total_pages}
                            </span>
                        )}
                    </div>

                    {data.items.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-400">
                            No patients match your filters.
                        </div>
                    ) : (
                        <>
                            {/* Column headers */}
                            <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b border-slate-100 bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                <div className="col-span-4">Patient</div>
                                <div className="col-span-2">Phone</div>
                                <div className="col-span-1">Age</div>
                                <div className="col-span-2">Type</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-1" />
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-slate-50">
                                {data.items.map((patient: any) => (
                                    <button
                                        key={patient.id}
                                        onClick={() => navigate(`/patients/${patient.id}`)}
                                        className="w-full grid grid-cols-12 gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left items-center group"
                                    >
                                        <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                                {patient.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-medium text-slate-800 truncate">{patient.name}</span>
                                        </div>
                                        <div className="col-span-2 text-xs text-slate-500 tabular-nums">{patient.phone}</div>
                                        <div className="col-span-1 text-xs text-slate-500 tabular-nums">{patient.age ?? '—'}</div>
                                        <div className="col-span-2">
                                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${patient.patient_type === 'pregnant'
                                                    ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
                                                    : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                                }`}>
                                                {patient.patient_type === 'pregnant' ? 'Pregnant' : 'Regular'}
                                            </span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${STATUS_COLORS[patient.status] ?? 'bg-slate-50 text-slate-600 ring-1 ring-slate-200'
                                                }`}>
                                                {patient.status}
                                            </span>
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Pagination */}
                            {data.total_pages > 1 && (
                                <div className="flex items-center justify-end gap-1.5 px-4 py-2 border-t border-slate-100 bg-slate-50">
                                    <button
                                        onClick={() => handlePageChange(data.page - 1)}
                                        disabled={!data.has_previous}
                                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-3 h-3" /> Prev
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(data.page + 1)}
                                        disabled={!data.has_next}
                                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};