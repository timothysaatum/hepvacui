import React, { useState } from 'react';
import { CreditCard, ChevronLeft, ChevronRight, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { usePaymentSearch } from '../../hooks/useSearch';
import type { PaymentSearchFilters, PaymentSearchResult } from '../../types/search';
import { SearchFilters } from '../../components/search/SearchFilters';
import { formatDate, formatCurrency } from '../../utils/formatters';
// import { useAuth } from '../../context/AuthContext';
import { useAuth } from '../../context/useAuth'


const PAYMENT_FILTER_FIELDS = [
    { name: 'patient_name', label: 'Patient Name', type: 'text' as const, placeholder: 'Search patient...' },
    { name: 'patient_phone', label: 'Patient Phone', type: 'text' as const, placeholder: 'Phone...' },
    {
        name: 'payment_method',
        label: 'Payment Method',
        type: 'select' as const,
        options: [
            { value: 'cash', label: 'Cash' },
            { value: 'mobile_money', label: 'Mobile Money' },
            { value: 'bank_transfer', label: 'Bank Transfer' },
            { value: 'card', label: 'Card' },
            { value: 'cheque', label: 'Cheque' },
        ],
    },
    { name: 'reference_number', label: 'Reference Number', type: 'text' as const, placeholder: 'TXN...' },
    { name: 'payment_date_from', label: 'Payment Date From', type: 'date' as const },
    { name: 'payment_date_to', label: 'Payment Date To', type: 'date' as const },
    { name: 'amount_min', label: 'Min Amount', type: 'number' as const, placeholder: '0' },
    { name: 'amount_max', label: 'Max Amount', type: 'number' as const, placeholder: '10000' },
];

export const PaymentSearchTab: React.FC = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState<PaymentSearchFilters>({
        page: 1,
        page_size: 10,
        facility_id: user?.facility?.id,
    });

    const [searchTrigger, setSearchTrigger] = useState(0);
    const { data, isFetching, error } = usePaymentSearch(filters, searchTrigger > 0);

    const handleFilterChange = <K extends keyof PaymentSearchFilters>(
      name: K,
      value: PaymentSearchFilters[K]
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
                fields={PAYMENT_FILTER_FIELDS}
                isPending={isFetching}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                        <h3 className="font-semibold text-red-900 mb-1">Search Error</h3>
                        <p className="text-sm text-red-700">Failed to search payments.</p>
                    </div>
                </div>
            )}

            {searchTrigger === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">Search for Payments</h3>
                    <p className="text-gray-600">Use the filters above to search payment records.</p>
                </div>
            )}

            {searchTrigger > 0 && !isFetching && !error && data && (
                <>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-black">Search Results</h3>
                                <p className="text-sm text-gray-600">
                                    {data.total_count} payment{data.total_count !== 1 ? 's' : ''} found • Total:{' '}
                                    <span className="font-bold text-black">{formatCurrency(data.total_amount)}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {data.items.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-black mb-2">No Payments Found</h3>
                            <p className="text-gray-600">Try adjusting your search filters.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 mb-6">
                                {data.items.map((payment) => (
                                    <PaymentCard key={payment.id} payment={payment} />
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
                                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(data.page + 1)}
                                            disabled={!data.has_next}
                                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
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

const PaymentCard: React.FC<{ payment: PaymentSearchResult }> = ({ payment }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-4">
            <div>
                <h3 className="text-lg font-bold text-black mb-1">{payment.patient_name}</h3>
                <p className="text-sm text-gray-600">{payment.patient_phone} • {payment.vaccine_name}</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-black">{formatCurrency(payment.amount)}</p>
                <p className="text-xs text-gray-600">{payment.payment_method}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
                <p className="text-gray-600 mb-1">Payment Date</p>
                <p className="font-semibold text-black flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {formatDate(payment.payment_date)}
                </p>
            </div>
            {payment.reference_number && (
                <div>
                    <p className="text-gray-600 mb-1">Reference</p>
                    <p className="font-semibold text-black">{payment.reference_number}</p>
                </div>
            )}
            <div>
                <p className="text-gray-600 mb-1">Recorded</p>
                <p className="font-semibold text-black">{formatDate(payment.created_at)}</p>
            </div>
        </div>
    </div>
);