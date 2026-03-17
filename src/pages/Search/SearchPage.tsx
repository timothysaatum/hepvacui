import React, { useState } from 'react';
import { Users, Syringe, CreditCard, Search } from 'lucide-react';
import { PatientSearchTab } from './PatientSearchTab';
import { VaccinationSearchTab } from './VaccinationSearchTab';
import { PaymentSearchTab } from './PaymentSearchTab';

type SearchTab = 'patients' | 'vaccinations' | 'payments';

export const SearchPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SearchTab>('patients');

    const tabs = [
        { id: 'patients' as const, label: 'Patients', icon: Users },
        { id: 'vaccinations' as const, label: 'Vaccinations', icon: Syringe },
        { id: 'payments' as const, label: 'Payments', icon: CreditCard },
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                        <Search className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-slate-900">Advanced Search</h1>
                        <p className="text-xs text-slate-500">Search across patients, vaccinations, and payments</p>
                    </div>
                </div>
            </div>

            {/* Tabs + Content */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tab bar */}
                <div className="flex items-center border-b border-slate-100 px-1 bg-slate-50">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all relative border-b-2 ${active
                                        ? 'text-slate-900 border-slate-900'
                                        : 'text-slate-500 border-transparent hover:text-slate-700'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                <div className="p-4">
                    {activeTab === 'patients' && <PatientSearchTab />}
                    {activeTab === 'vaccinations' && <VaccinationSearchTab />}
                    {activeTab === 'payments' && <PaymentSearchTab />}
                </div>
            </div>
        </div>
    );
};