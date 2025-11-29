import React, { useState } from 'react';
import {
    TrendingUp,
    Users,
    Syringe,
    DollarSign,
    Building2,
    Monitor,
    Calendar,
    Activity,
    ArrowUp,
    ArrowDown,
    Pill,
    AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    useDashboardOverview,
    useVaccineUsage,
    useRevenueAnalytics,
    useFacilityPerformance,
    useDeviceAnalytics,
    useVaccinationTrends,
} from '../../hooks/useDashboard';
import { formatCurrency } from '../../utils/formatters';
import type { DashboardFilters } from '../../types/dashboard';

export const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.roles?.some((role) => role.name.toLowerCase() === 'admin');

    const currentYear = new Date().getFullYear();
    const [filters, setFilters] = useState<DashboardFilters>({
        year: currentYear,
        facility_id: user?.facility_id,
    });

    // Fetch all dashboard data
    const { data: overview, isLoading: overviewLoading } = useDashboardOverview(filters.facility_id);
    const { data: vaccineUsage } = useVaccineUsage(filters);
    const { data: revenue } = useRevenueAnalytics(filters);
    const { data: facilities } = useFacilityPerformance();
    const { data: devices } = useDeviceAnalytics();
    useVaccinationTrends(filters);

    const handleYearChange = (year: number) => {
        setFilters((prev) => ({ ...prev, year }));
    };

    return (
        <div className="space-y-6" >
            {/* Header */}
            < div className="flex items-center justify-between" >
                <div>
                    <h1 className="text-3xl font-bold text-black" > Dashboard </h1>
                    < p className="text-gray-600 mt-1" > Welcome back, {user?.full_name} </p>
                </div>

                {/* Year Filter */}
                <select
                    value={filters.year || currentYear}
                    onChange={(e) => handleYearChange(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
                >
                    {
                        [currentYear, currentYear - 1, currentYear - 2].map((year) => (
                            <option key={year} value={year} >
                                {year}
                            </option>
                        ))
                    }
                </select>
            </div>

            {/* Loading State */}
            {
                overviewLoading && (
                    <div className="flex justify-center items-center py-12" >
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" > </div>
                    </div>
                )
            }

            {
                !overviewLoading && overview && (
                    <>
                        {/* Key Metrics */}
                        < div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" >
                            <MetricCard
                                title="Total Patients"
                                value={overview.total_patients}
                                subtitle={`${overview.active_patients} active`
                                }
                                icon={< Users className="w-6 h-6" />}
                                trend="+12%"
                                trendUp
                            />
                            <MetricCard
                                title="Total Vaccinations"
                                value={overview.total_vaccinations}
                                subtitle={`${overview.vaccinations_this_month} this month`}
                                icon={< Syringe className="w-6 h-6" />}
                                trend="+8%"
                                trendUp
                            />
                            <MetricCard
                                title="Total Revenue"
                                value={formatCurrency(overview.total_revenue)}
                                subtitle={`${formatCurrency(overview.revenue_this_month)} this month`}
                                icon={<span className="text-lg font-bold">GH₵</span>}
                                trend="+15%"
                                trendUp
                            />
                            <MetricCard
                                title="Outstanding Balance"
                                value={formatCurrency(overview.outstanding_balance)}
                                subtitle={`${overview.active_vaccine_purchases} active purchases`}
                                icon={<span className="text-lg font-bold">GH₵</span>}
                                trend="-5%"
                                trendUp={false}
                            />
                        </div>

                        {/* Secondary Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" >
                            <StatCard
                                title="Vaccine Stock"
                                value={overview.total_vaccines}
                                subtitle={`${overview.low_stock_vaccines} low stock`}
                                icon={< Pill className="w-5 h-5" />}
                                alert={overview.low_stock_vaccines > 0}
                            />
                            <StatCard
                                title="Device Access"
                                value={overview.trusted_devices}
                                subtitle={`${overview.pending_devices} pending approval`}
                                icon={< Monitor className="w-5 h-5" />}
                                alert={overview.pending_devices > 5}
                            />
                            <StatCard
                                title="Completed Purchases"
                                value={overview.completed_vaccine_purchases}
                                subtitle={`${overview.active_vaccine_purchases} in progress`}
                                icon={< Activity className="w-5 h-5" />}
                            />
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" >
                            {/* Vaccine Usage Chart */}
                            < div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6" >
                                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2" >
                                    <Syringe className="w-5 h-5" />
                                    Vaccine Usage
                                </h3>
                                {
                                    vaccineUsage && vaccineUsage.items.length > 0 ? (
                                        <div className="space-y-3" >
                                            {
                                                vaccineUsage.items.slice(0, 5).map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between" >
                                                        <div className="flex-1" >
                                                            <div className="flex items-center justify-between mb-1" >
                                                                <span className="text-sm font-medium text-black" > {item.vaccine_name} </span>
                                                                < span className="text-sm font-semibold text-black" > {item.total_doses_administered} doses </span>
                                                            </div>
                                                            < div className="w-full bg-gray-200 rounded-full h-2" >
                                                                <div
                                                                    className="bg-black h-2 rounded-full"
                                                                    style={{
                                                                        width: `${(item.total_doses_administered / vaccineUsage.total_doses) * 100}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                            <div className="pt-3 border-t border-gray-200 text-sm text-gray-600" >
                                                Total: {vaccineUsage.total_doses} doses • {formatCurrency(vaccineUsage.total_revenue)} revenue
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500" > No vaccine usage data </div>
                                    )}
                            </div>

                            {/* Revenue Chart */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6" >
                                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2" >
                                    <span className="text-lg font-bold">GH₵</span>
                                    Monthly Revenue
                                </h3>
                                {
                                    revenue && revenue.yearly_breakdown.length > 0 ? (
                                        <div className="space-y-3" >
                                            {
                                                revenue.yearly_breakdown[0].monthly_breakdown.slice(0, 6).map((month) => (
                                                    <div key={`${month.year}-${month.month}`} className="flex items-center justify-between" >
                                                        <span className="text-sm font-medium text-gray-700 w-16" > {month.month_name} </span>
                                                        < div className="flex-1 mx-3" >
                                                            <div className="w-full bg-gray-200 rounded-full h-2" >
                                                                <div
                                                                    className="bg-black h-2 rounded-full"
                                                                    style={{
                                                                        width: `${(month.total_revenue / revenue.yearly_breakdown[0].total_revenue) * 100}%`,
                                                                    }
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                        < span className="text-sm font-semibold text-black w-24 text-right" >
                                                            {formatCurrency(month.total_revenue)}
                                                        </span>
                                                    </div>
                                                ))}
                                            <div className="pt-3 border-t border-gray-200 text-sm font-semibold text-black" >
                                                Total {filters.year}: {formatCurrency(revenue.total_revenue)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500" > No revenue data </div>
                                    )}
                            </div>
                        </div>

                        {/* Facility Performance (Admin Only) */}
                        {
                            isAdmin && facilities && facilities.items.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6" >
                                    <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2" >
                                        <Building2 className="w-5 h-5" />
                                        Facility Performance
                                    </h3>
                                    < div className="overflow-x-auto" >
                                        <table className="w-full" >
                                            <thead className="bg-gray-50 border-b border-gray-200" >
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700" > Facility </th>
                                                    < th className="px-4 py-3 text-right text-xs font-semibold text-gray-700" > Patients </th>
                                                    < th className="px-4 py-3 text-right text-xs font-semibold text-gray-700" > Vaccinations </th>
                                                    < th className="px-4 py-3 text-right text-xs font-semibold text-gray-700" > Revenue </th>
                                                    < th className="px-4 py-3 text-right text-xs font-semibold text-gray-700" > Avg / Patient </th>
                                                    < th className="px-4 py-3 text-right text-xs font-semibold text-gray-700" > Staff </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    facilities.items.map((facility, idx) => (
                                                        <tr key={facility.facility_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="px-4 py-3 text-sm font-medium text-black" > {facility.facility_name} </td>
                                                            < td className="px-4 py-3 text-sm text-right text-gray-900" > {facility.total_patients} </td>
                                                            < td className="px-4 py-3 text-sm text-right text-gray-900" > {facility.total_vaccinations} </td>
                                                            < td className="px-4 py-3 text-sm text-right font-semibold text-black" >
                                                                {formatCurrency(facility.total_revenue)}
                                                            </td>
                                                            < td className="px-4 py-3 text-sm text-right text-gray-900" >
                                                                {formatCurrency(facility.average_revenue_per_patient)}
                                                            </td>
                                                            < td className="px-4 py-3 text-sm text-right text-gray-900" > {facility.staff_count} </td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                    {
                                        facilities.top_performing_facility && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between" >
                                                <span className="text-sm font-medium text-gray-700" > Top Performing: </span>
                                                < span className="text-sm font-bold text-black" > {facilities.top_performing_facility.facility_name} </span>
                                            </div>
                                        )
                                    }
                                </div>
                            )}

                        {/* Device Analytics */}
                        {
                            devices && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" >
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6" >
                                        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2" >
                                            <Monitor className="w-5 h-5" />
                                            Device Status
                                        </h3>
                                        < div className="space-y-3" >
                                            {
                                                devices.by_status.map((item) => (
                                                    <div key={item.status} className="flex items-center justify-between" >
                                                        <span className="text-sm font-medium text-gray-700 capitalize" > {item.status} </span>
                                                        < span className="text-sm font-semibold text-black" > {item.count} </span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        < div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600" >
                                            Total Devices: {devices.total_devices}
                                        </div>
                                    </div>

                                    < div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6" >
                                        <h3 className="text-lg font-bold text-black mb-4" > Top Browsers </h3>
                                        < div className="space-y-3" >
                                            {
                                                devices.by_browser.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between" >
                                                        <span className="text-sm font-medium text-gray-700" > {item.browser} </span>
                                                        < span className="text-sm font-semibold text-black" > {item.count} </span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </>
                )}
        </div>
    );
};

// Helper Components
const MetricCard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
}> = ({ title, value, subtitle, icon, trend, trendUp }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all" >
        <div className="flex items-center justify-between mb-4" >
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center" > {icon} </div>
            {
                trend && (
                    <div className={`flex items-center gap-1 text-sm font-semibold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {trendUp ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        {trend}
                    </div>
                )}
        </div>
        < h3 className="text-sm font-medium text-gray-600 mb-1" > {title} </h3>
        < p className="text-3xl font-bold text-black mb-1" > {value} </p>
        < p className="text-xs text-gray-600" > {subtitle} </p>
    </div>
);

const StatCard: React.FC<{
    title: string;
    value: number;
    subtitle: string;
    icon: React.ReactNode;
    alert?: boolean;
}> = ({ title, value, subtitle, icon, alert }) => (
    <div className={`bg-white rounded-xl border p-4 ${alert ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-2" >
            <div className="flex items-center gap-2" >
                {icon}
                < span className="text-sm font-medium text-gray-700" > {title} </span>
            </div>
            {alert && <AlertCircle className="w-4 h-4 text-orange-600" />}
        </div>
        < p className="text-2xl font-bold text-black mb-1" > {value} </p>
        < p className="text-xs text-gray-600" > {subtitle} </p>
    </div>
);