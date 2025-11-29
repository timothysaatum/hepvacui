// src/pages/Search/SearchPage.tsx

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
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
                        <Search className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-black">Advanced Search</h1>
                        <p className="text-sm text-gray-600">
                            Search across patients, vaccinations, and payment records
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all relative ${activeTab === tab.id
                                        ? 'text-black'
                                        : 'text-gray-500 hover:text-black'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'patients' && <PatientSearchTab />}
                {activeTab === 'vaccinations' && <VaccinationSearchTab />}
                {activeTab === 'payments' && <PaymentSearchTab />}
            </div>
        </div>
    );
};