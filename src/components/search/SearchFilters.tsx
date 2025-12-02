import { Search, X, Filter } from 'lucide-react';

interface FilterField {
    name: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'number';
    options?: { value: string; label: string }[];
    placeholder?: string;
}

interface SearchFiltersProps<T extends Record<string, any>> {
    filters: T;
    onFilterChange: <K extends keyof T>(name: K, value: T[K]) => void;
    onClear: () => void;
    onSearch: () => void;
    fields: FilterField[];
    isPending?: boolean;
}

export function SearchFilters<T extends Record<string, any>>({
    filters,
    onFilterChange,
    onClear,
    onSearch,
    fields,
    isPending = false,
}: SearchFiltersProps<T>) {
    const hasActiveFilters = Object.values(filters).some(
        (value) => value !== undefined && value !== null && value !== ''
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-black" />
                    <h3 className="text-lg font-bold text-black">Search Filters</h3>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={onClear}
                        className="text-sm text-gray-600 hover:text-black flex items-center gap-1 transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Clear All
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {fields.map((field) => (
                    <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                        </label>
                        {field.type === 'select' ? (
                            <select
                                value={String(filters[field.name as keyof T] || '')}
                                onChange={(e) => onFilterChange(field.name as keyof T, e.target.value as T[keyof T])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            >
                                <option value="">All</option>
                                {field.options?.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type}
                                value={String(filters[field.name as keyof T] || '')}
                                onChange={(e) =>
                                    onFilterChange(
                                        field.name as keyof T,
                                        (field.type === 'number' ? Number(e.target.value) : e.target.value) as T[keyof T]
                                    )
                                }
                                placeholder={field.placeholder}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    onClick={onSearch}
                    disabled={isPending}
                    className="flex-1 px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Searching...
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4" />
                            Search
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}