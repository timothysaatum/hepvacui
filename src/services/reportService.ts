/**
 * reportService.ts
 *
 * Client for GET /reports/export.
 *
 * The endpoint returns a binary .xlsx file.  We download it as a Blob
 * and trigger a browser save-as — no dependencies beyond the existing
 * `api` Axios instance.
 */

import api from './api';

// ─────────────────────────────────────────────────────────────────────────────
// Filter types  (mirror report_schemas.py)
// ─────────────────────────────────────────────────────────────────────────────

export interface ReportFilters {
    // Date window
    date_from?: string;   // YYYY-MM-DD
    date_to?: string;

    // Patient scope
    patient_type?: 'pregnant' | 'regular' | '';
    patient_status?: 'active' | 'inactive' | 'postpartum' | 'completed' | '';
    facility_id?: string;

    // Sheet toggles
    include_patients?: boolean;
    include_pregnancies?: boolean;
    include_children?: boolean;
    include_transactions?: boolean;
    include_vaccinations?: boolean;
    include_prescriptions?: boolean;
    include_medications?: boolean;
    include_diagnoses?: boolean;
    include_reminders?: boolean;
    include_stock?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strip undefined / empty-string values so they don't appear in the
 * query string and accidentally override server defaults.
 */
const clean = (filters: ReportFilters): Record<string, string | boolean> => {
    const out: Record<string, string | boolean> = {};
    for (const [k, v] of Object.entries(filters)) {
        if (v !== undefined && v !== '' && v !== null) {
            out[k] = v as string | boolean;
        }
    }
    return out;
};

export const reportService = {
    /**
     * Download a filtered Excel report.
     *
     * Uses Axios with responseType: 'blob', then creates an object URL
     * and clicks a hidden anchor to trigger the browser download dialog.
     *
     * @param filters  Export parameters (all optional — defaults to all data).
     * @param onProgress  Optional callback receiving 0-100 progress value.
     */
    async exportExcel(
        filters: ReportFilters = {},
        onProgress?: (pct: number) => void,
    ): Promise<void> {
        const response = await api.get('api/v1/reports/export', {
            params: clean(filters),
            responseType: 'blob',
            onDownloadProgress: (evt) => {
                if (onProgress && evt.total) {
                    onProgress(Math.round((evt.loaded / evt.total) * 100));
                }
            },
        });

        // Prefer the filename the server set in Content-Disposition
        let filename = `drive4health_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
        const disposition: string | undefined =
            response.headers['content-disposition'] ??
            response.headers['x-report-filename'];
        if (disposition) {
            const match = disposition.match(/filename="?([^";\n]+)"?/i);
            if (match?.[1]) filename = match[1];
        }

        const url = URL.createObjectURL(new Blob([response.data]));
        const a = Object.assign(document.createElement('a'), {
            href: url,
            download: filename,
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
};