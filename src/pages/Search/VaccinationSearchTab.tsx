import React, { useState } from 'react';
import { Syringe, ChevronLeft, ChevronRight, AlertCircle, Calendar, User } from 'lucide-react';
import { useVaccinationSearch } from '../../hooks/useSearch';
import type { VaccinationSearchFilters, VaccinationSearchResult } from '../../types/search';
import { SearchFilters } from '../../components/search/SearchFilters';
import { formatDate, formatCurrency } from '../../utils/formatters';
// import { useAuth } from '../../context/AuthContext';
import { useAuth } from '../../context/useAuth'

const FILTER_FIELDS = [
    { name: 'patient_name', label: 'Patient Name', type: 'text' as const, placeholder: 'Search patient...' },
    { name: 'patient_phone', label: 'Patient Phone', type: 'text' as const, placeholder: 'Phone number...' },
    { name: 'vaccine_name', label: 'Vaccine Name', type: 'text' as const, placeholder: 'Search vaccine...' },
    { name: 'batch_number', label: 'Batch Number', type: 'text' as const, placeholder: 'Batch...' },
    {
        name: 'dose_number',
        label: 'Dose Number',
        type: 'select' as const,
        options: [
            { value: '1st dose', label: '1st Dose' },
            { value: '2nd dose', label: '2nd Dose' },
            { value: '3rd dose', label: '3rd Dose' },
        ],
    },
    { name: 'dose_date_from', label: 'Dose Date From', type: 'date' as const },
    { name: 'dose_date_to', label: 'Dose Date To', type: 'date' as const },
];

export const VaccinationSearchTab: React.FC = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState<VaccinationSearchFilters>({
        page: 1,
        page_size: 10,
        facility_id: user?.facility?.id,
    });

    const [searchTrigger, setSearchTrigger] = useState(0);
    const { data, isFetching, error } = useVaccinationSearch(filters, searchTrigger > 0);

    const handleFilterChange = <
      K extends keyof VaccinationSearchFilters
    >(
      name: K,
      value: VaccinationSearchFilters[K]
    ) => {
      setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
    };

    const handleClearFilters = () => {
        setFilters({ page: 1, page_size: 10, facility_id: user?.facility?.id });
        setSearchTrigger(0);
    };

    const handleSearch = () => setSearchTrigger((prev) => prev + 1);

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

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-red-900 mb-1">Search Error</h3>
                        <p className="text-sm text-red-700">Failed to search vaccinations. Please try again.</p>
                    </div>
                </div>
            )}

            {searchTrigger === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Syringe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">Search for Vaccinations</h3>
                    <p className="text-gray-600">Use the filters above to search vaccination records.</p>
                </div>
            )}

            {searchTrigger > 0 && !isFetching && !error && data && (
                <>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                <Syringe className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-black">Search Results</h3>
                                <p className="text-sm text-gray-600">
                                    {data.total_count} vaccination{data.total_count !== 1 ? 's' : ''} found
                                </p>
                            </div>
                        </div>
                    </div>

                    {data.items.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <Syringe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-black mb-2">No Vaccinations Found</h3>
                            <p className="text-gray-600">Try adjusting your search filters.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 mb-6">
                                {data.items.map((vaccination) => (
                                    <VaccinationCard key={vaccination.id} vaccination={vaccination} />
                                ))}
                            </div>

                            {data.total_pages > 1 && (
                                <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="text-sm text-gray-600">
                                        Page {data.page} of {data.total_pages}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(data.page - 1)}
                                            disabled={!data.has_previous}
                                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(data.page + 1)}
                                            disabled={!data.has_next}
                                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

const VaccinationCard: React.FC<{ vaccination: VaccinationSearchResult }> = ({ vaccination }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-4">
            <div>
                <h3 className="text-lg font-bold text-black mb-1">{vaccination.vaccine_name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    {vaccination.patient_name} • {vaccination.patient_phone}
                </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-semibold border border-gray-200">
                {vaccination.dose_number}
            </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
                <p className="text-gray-600 mb-1">Dose Date</p>
                <p className="font-semibold text-black flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(vaccination.dose_date)}
                </p>
            </div>
            <div>
                <p className="text-gray-600 mb-1">Batch Number</p>
                <p className="font-semibold text-black">{vaccination.batch_number}</p>
            </div>
            <div>
                <p className="text-gray-600 mb-1">Price</p>
                <p className="font-semibold text-black">{formatCurrency(vaccination.vaccine_price)}</p>
            </div>
            <div>
                <p className="text-gray-600 mb-1">Administered</p>
                <p className="font-semibold text-black">{formatDate(vaccination.created_at)}</p>
            </div>
        </div>

        {vaccination.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Notes</p>
                <p className="text-sm text-black">{vaccination.notes}</p>
            </div>
        )}
    </div>
);