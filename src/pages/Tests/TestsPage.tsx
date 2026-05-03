import React from 'react';
import { AlertTriangle, TestTube2 } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { LabTestDefinitionManager } from '../../components/labtests/LabTestDefinitionManager';

export const TestsPage: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.roles?.some(role => role.name.toLowerCase() === 'admin');

    if (!isAdmin) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    <div>
                        <h3 className="font-semibold text-yellow-900">Admin Access Required</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                            You need administrator privileges to manage lab tests.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tests Management</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Configure reusable lab tests, parameters, reference ranges, and result rules
                    </p>
                </div>

                <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-lg bg-teal-100">
                    <TestTube2 className="h-5 w-5 text-teal-700" />
                </div>
            </div>

            <LabTestDefinitionManager />
        </div>
    );
};
