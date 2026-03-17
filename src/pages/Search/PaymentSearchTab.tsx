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

const METHOD_COLORS: Record<string, string> = {
    cash: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    mobile_money: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
    bank_transfer: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    card: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
    cheque: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200',
};

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
        <div className="space-y-3">
            <SearchFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={() => { setFilters({ page: 1, page_size: 10, facility_id: user?.facility?.id }); setSearchTrigger(0); }}
                onSearch={() => setSearchTrigger(prev => prev + 1)}
                fields={PAYMENT_FILTER_FIELDS}
                isPending={isFetching}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-700">Failed to search payments. Please try again.</p>
                </div>
            )}

            {searchTrigger === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mb-2.5">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Search for Payments</p>
                    <p className="text-xs text-slate-400 mt-0.5">Apply filters above and click Search</p>
                </div>
            )}

            {searchTrigger > 0 && !isFetching && !error && data && (
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                        <span className="text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">{data.total_count}</span>{' '}
                            payment{data.total_count !== 1 ? 's' : ''} found
                        </span>
                        {data.total_count > 0 && (
                            <span className="text-xs text-slate-500">
                                Total:{' '}
                                <span className="font-semibold text-emerald-700 tabular-nums">
                                    {formatCurrency(data.total_amount)}
                                </span>
                            </span>
                        )}
                    </div>

                    {data.items.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-400">No payments match your filters.</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b border-slate-100 bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                <div className="col-span-3">Patient</div>
                                <div className="col-span-2">Vaccine</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-2">Method</div>
                                <div className="col-span-2">Reference</div>
                                <div className="col-span-1 text-right">Amount</div>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {data.items.map((payment: PaymentSearchResult) => (
                                    <div key={payment.id} className="grid grid-cols-12 gap-3 px-4 py-2.5 items-center hover:bg-slate-50 transition-colors">
                                        <div className="col-span-3 min-w-0">
                                            <p className="text-xs font-medium text-slate-800 truncate">{payment.patient_name}</p>
                                            <p className="text-[10px] text-slate-400 tabular-nums">{payment.patient_phone}</p>
                                        </div>
                                        <div className="col-span-2 text-xs text-slate-600 truncate">{payment.vaccine_name}</div>
                                        <div className="col-span-2 text-xs text-slate-500 tabular-nums">{formatDate(payment.payment_date)}</div>
                                        <div className="col-span-2">
                                            {payment.payment_method ? (
                                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${METHOD_COLORS[payment.payment_method] ?? 'bg-slate-50 text-slate-600 ring-1 ring-slate-200'}`}>
                                                    {METHOD_LABELS[payment.payment_method] ?? payment.payment_method}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-300">—</span>
                                            )}
                                        </div>
                                        <div className="col-span-2 text-[10px] text-slate-400 font-mono truncate">
                                            {payment.reference_number ?? '—'}
                                        </div>
                                        <div className="col-span-1 text-right text-xs font-semibold text-emerald-700 tabular-nums">
                                            {formatCurrency(payment.amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>

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