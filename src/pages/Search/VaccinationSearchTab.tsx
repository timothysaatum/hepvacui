import React, { useState } from 'react';
import { Syringe, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useVaccinationSearch } from '../../hooks/useSearch';
import type { VaccinationSearchFilters, VaccinationSearchResult } from '../../types/search';
import { SearchFilters } from '../../components/search/SearchFilters';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/useAuth';

const FILTER_FIELDS = [
    { name: 'patient_name', label: 'Patient Name', type: 'text' as const, placeholder: 'Search patient...' },
    { name: 'patient_phone', label: 'Patient Phone', type: 'text' as const, placeholder: 'Phone number...' },
    { name: 'vaccine_name', label: 'Vaccine Name', type: 'text' as const, placeholder: 'Search vaccine...' },
    { name: 'batch_number', label: 'Batch Number', type: 'text' as const, placeholder: 'Batch...' },
    {
        name: 'dose_number', label: 'Dose Number', type: 'select' as const, options: [
            { value: '1st dose', label: '1st Dose' },
            { value: '2nd dose', label: '2nd Dose' },
            { value: '3rd dose', label: '3rd Dose' },
        ]
    },
    { name: 'dose_date_from', label: 'Dose Date From', type: 'date' as const },
    { name: 'dose_date_to', label: 'Dose Date To', type: 'date' as const },
];

const DOSE_COLORS: Record<string, string> = {
    '1st dose': 'bg-blue-100 text-blue-700',
    '2nd dose': 'bg-teal-100 text-teal-700',
    '3rd dose': 'bg-emerald-100 text-emerald-700',
};

export const VaccinationSearchTab: React.FC = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState<VaccinationSearchFilters>({
        page: 1, page_size: 10, facility_id: user?.facility?.id,
    });
    const [searchTrigger, setSearchTrigger] = useState(0);
    const { data, isFetching, error } = useVaccinationSearch(filters, searchTrigger > 0);

    const handleFilterChange = <K extends keyof VaccinationSearchFilters>(name: K, value: VaccinationSearchFilters[K]) =>
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
        setSearchTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-4">
            <SearchFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={() => { setFilters({ page: 1, page_size: 10, facility_id: user?.facility?.id }); setSearchTrigger(0); }}
                onSearch={() => setSearchTrigger(prev => prev + 1)}
                fields={FILTER_FIELDS}
                isPending={isFetching}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">Failed to search vaccinations. Please try again.</p>
                </div>
            )}

            {searchTrigger === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Syringe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-700 mb-1">Search for Vaccinations</h3>
                    <p className="text-sm text-gray-500">Use the filters above to search vaccination records.</p>
                </div>
            )}

            {searchTrigger > 0 && !isFetching && !error && data && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                        <span className="text-sm font-semibold text-gray-700">
                            {data.total_count} vaccination{data.total_count !== 1 ? 's' : ''} found
                        </span>
                    </div>

                    {data.items.length === 0 ? (
                        <div className="py-12 text-center text-sm text-gray-500">No vaccinations match your filters.</div>
                    ) : (
                        <>
                            {/* Column headers */}
                            <div className="grid grid-cols-12 gap-4 px-5 py-2.5 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                <div className="col-span-3">Patient</div>
                                <div className="col-span-2">Vaccine</div>
                                <div className="col-span-2">Dose</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-2">Batch</div>
                                <div className="col-span-1 text-right">Price</div>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {data.items.map((v: VaccinationSearchResult) => (
                                    <div key={v.id} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-slate-50 transition-colors">
                                        <div className="col-span-3 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{v.patient_name}</p>
                                            <p className="text-xs text-gray-500">{v.patient_phone}</p>
                                        </div>
                                        <div className="col-span-2 text-sm text-gray-700 font-medium truncate">{v.vaccine_name}</div>
                                        <div className="col-span-2">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${DOSE_COLORS[v.dose_number] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {v.dose_number}
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-sm text-gray-600">{formatDate(v.dose_date)}</div>
                                        <div className="col-span-2 text-sm text-gray-500 font-mono text-xs">{v.batch_number}</div>
                                        <div className="col-span-1 text-right text-sm font-semibold text-gray-900">
                                            {formatCurrency(v.vaccine_price)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Notes expansion — shown inline under the row if present */}
                            {data.items.some((v: VaccinationSearchResult) => v.notes) && (
                                <div className="px-5 py-2 bg-amber-50 border-t border-amber-100">
                                    <p className="text-xs text-amber-700 font-medium">Some records have notes — hover or expand to view.</p>
                                </div>
                            )}

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