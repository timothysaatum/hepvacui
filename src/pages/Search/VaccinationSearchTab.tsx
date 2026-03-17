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
    '1st dose': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    '2nd dose': 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
    '3rd dose': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
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
        <div className="space-y-3">
            <SearchFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={() => { setFilters({ page: 1, page_size: 10, facility_id: user?.facility?.id }); setSearchTrigger(0); }}
                onSearch={() => setSearchTrigger(prev => prev + 1)}
                fields={FILTER_FIELDS}
                isPending={isFetching}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-700">Failed to search vaccinations. Please try again.</p>
                </div>
            )}

            {searchTrigger === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mb-2.5">
                        <Syringe className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Search for Vaccinations</p>
                    <p className="text-xs text-slate-400 mt-0.5">Apply filters above and click Search</p>
                </div>
            )}

            {searchTrigger > 0 && !isFetching && !error && data && (
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                        <span className="text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">{data.total_count}</span>{' '}
                            vaccination{data.total_count !== 1 ? 's' : ''} found
                        </span>
                        {data.total_pages > 1 && (
                            <span className="text-xs text-slate-400">Page {data.page} of {data.total_pages}</span>
                        )}
                    </div>

                    {data.items.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-400">No vaccinations match your filters.</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b border-slate-100 bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                <div className="col-span-3">Patient</div>
                                <div className="col-span-3">Vaccine</div>
                                <div className="col-span-2">Dose</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-1">Batch</div>
                                <div className="col-span-1 text-right">Price</div>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {data.items.map((v: VaccinationSearchResult) => (
                                    <div key={v.id} className="grid grid-cols-12 gap-3 px-4 py-2.5 items-center hover:bg-slate-50 transition-colors">
                                        <div className="col-span-3 min-w-0">
                                            <p className="text-xs font-medium text-slate-800 truncate">{v.patient_name}</p>
                                            <p className="text-[10px] text-slate-400 tabular-nums">{v.patient_phone}</p>
                                        </div>
                                        <div className="col-span-3 text-xs font-medium text-slate-700 truncate">{v.vaccine_name}</div>
                                        <div className="col-span-2">
                                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${DOSE_COLORS[v.dose_number] ?? 'bg-slate-50 text-slate-600 ring-1 ring-slate-200'}`}>
                                                {v.dose_number}
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-xs text-slate-500 tabular-nums">{formatDate(v.dose_date)}</div>
                                        <div className="col-span-1 text-[10px] text-slate-400 font-mono truncate">{v.batch_number}</div>
                                        <div className="col-span-1 text-right text-xs font-semibold text-slate-800 tabular-nums">
                                            {formatCurrency(v.vaccine_price)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {data.items.some((v: VaccinationSearchResult) => v.notes) && (
                                <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
                                    <p className="text-[10px] text-amber-600 font-medium">Some records have notes.</p>
                                </div>
                            )}

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