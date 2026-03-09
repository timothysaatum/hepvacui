import React, { useState } from 'react';
import { CreditCard, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { usePaymentSearch } from '../../hooks/useSearch';
import type { PaymentSearchFilters, PaymentSearchResult } from '../../types/search';
import { SearchFilters } from '../../components/search/SearchFilters';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/useAuth';

const PAYMENT_FILTER_FIELDS = [
    { name: 'patient_name', label: 'Patient Name', type: 'text' as const, placeholder: 'Search patient...' },
    { name: 'patient_phone', label: 'Patient Phone', type: 'text' as const, placeholder: 'Phone...' },
    {
        name: 'payment_method', label: 'Payment Method', type: 'select' as const, options: [
            { value: 'cash', label: 'Cash' },
            { value: 'mobile_money', label: 'Mobile Money' },
            { value: 'bank_transfer', label: 'Bank Transfer' },
            { value: 'card', label: 'Card' },
            { value: 'cheque', label: 'Cheque' },
        ]
    },
    { name: 'reference_number', label: 'Reference Number', type: 'text' as const, placeholder: 'TXN...' },
    { name: 'payment_date_from', label: 'Payment Date From', type: 'date' as const },
    { name: 'payment_date_to', label: 'Payment Date To', type: 'date' as const },
    { name: 'amount_min', label: 'Min Amount', type: 'number' as const, placeholder: '0' },
    { name: 'amount_max', label: 'Max Amount', type: 'number' as const, placeholder: '10000' },
];

const METHOD_LABELS: Record<string, string> = {
    cash: 'Cash',
    mobile_money: 'MoMo',
    bank_transfer: 'Bank',
    card: 'Card',
    cheque: 'Cheque',
};

export const PaymentSearchTab: React.FC = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState<PaymentSearchFilters>({
        page: 1, page_size: 10, facility_id: user?.facility?.id,
    });
    const [searchTrigger, setSearchTrigger] = useState(0);
    const { data, isFetching, error } = usePaymentSearch(filters, searchTrigger > 0);

    const handleFilterChange = <K extends keyof PaymentSearchFilters>(name: K, value: PaymentSearchFilters[K]) =>
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
                fields={PAYMENT_FILTER_FIELDS}
                isPending={isFetching}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">Failed to search payments. Please try again.</p>
                </div>
            )}

            {searchTrigger === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-700 mb-1">Search for Payments</h3>
                    <p className="text-sm text-gray-500">Use the filters above to search payment records.</p>
                </div>
            )}

            {searchTrigger > 0 && !isFetching && !error && data && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Summary bar */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                        <span className="text-sm font-semibold text-gray-700">
                            {data.total_count} payment{data.total_count !== 1 ? 's' : ''} found
                        </span>
                        {data.total_count > 0 && (
                            <span className="text-sm font-semibold text-gray-900">
                                Total: <span className="text-emerald-700">{formatCurrency(data.total_amount)}</span>
                            </span>
                        )}
                    </div>

                    {data.items.length === 0 ? (
                        <div className="py-12 text-center text-sm text-gray-500">No payments match your filters.</div>
                    ) : (
                        <>
                            {/* Column headers */}
                            <div className="grid grid-cols-12 gap-4 px-5 py-2.5 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                <div className="col-span-3">Patient</div>
                                <div className="col-span-2">Vaccine</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-2">Method</div>
                                <div className="col-span-2">Reference</div>
                                <div className="col-span-1 text-right">Amount</div>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {data.items.map((payment: PaymentSearchResult) => (
                                    <div key={payment.id} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-slate-50 transition-colors">
                                        <div className="col-span-3 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{payment.patient_name}</p>
                                            <p className="text-xs text-gray-500">{payment.patient_phone}</p>
                                        </div>
                                        <div className="col-span-2 text-sm text-gray-600 truncate">{payment.vaccine_name}</div>
                                        <div className="col-span-2 text-sm text-gray-600">{formatDate(payment.payment_date)}</div>
                                        <div className="col-span-2">
                                            {payment.payment_method ? (
                                                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                    {METHOD_LABELS[payment.payment_method] ?? payment.payment_method}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </div>
                                        <div className="col-span-2 text-sm text-gray-500 font-mono truncate">
                                            {payment.reference_number ?? '—'}
                                        </div>
                                        <div className="col-span-1 text-right text-sm font-semibold text-emerald-700">
                                            {formatCurrency(payment.amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>

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