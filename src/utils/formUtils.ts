/**
 * Utility functions for form data cleaning and transformation
 */

/**
 * Cleans form data by converting empty strings and null values to undefined
 * This is especially important for optional date fields that send empty strings
 * 
 * @param data - The form data object to clean
 * @returns Cleaned data object with empty strings and nulls converted to undefined
 */
export const cleanFormData = <T extends Record<string, any>>(data: T): T => {
    const cleaned: any = { ...data };

    Object.keys(cleaned).forEach((key) => {
        const value = cleaned[key];

        // Convert empty strings and null to undefined
        if (value === '' || value === null) {
            cleaned[key] = undefined;
        }
        // Trim string values to remove leading/trailing whitespace
        else if (typeof value === 'string' && value.trim() !== '') {
            cleaned[key] = value.trim();
        }
    });

    return cleaned as T;
};

/**
 * Converts empty date strings to undefined for API submission
 * 
 * @param data - The form data object
 * @param dateFields - Array of date field names to clean
 * @returns Cleaned data object
 */
export const cleanDateFields = <T extends Record<string, any>>(
    data: T,
    dateFields: (keyof T)[]
): T => {
    const cleaned = { ...data };

    dateFields.forEach((field) => {
        if (cleaned[field] === '' || cleaned[field] === null) {
            cleaned[field] = undefined as any;
        }
    });

    return cleaned;
};

/**
 * Validates that required fields are not empty
 * 
 * @param data - The form data object
 * @param requiredFields - Array of required field names
 * @returns Object with isValid boolean and array of missing field names
 */
export const validateRequiredFields = <T extends Record<string, any>>(
    data: T,
    requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];

    requiredFields.forEach((field) => {
        const value = data[field];
        if (value === undefined || value === null || value === '') {
            missingFields.push(String(field));
        }
    });

    return {
        isValid: missingFields.length === 0,
        missingFields,
    };
};

/**
 * Formats date for display (YYYY-MM-DD format for input fields)
 * 
 * @param date - Date string or Date object
 * @returns Formatted date string or empty string if invalid
 */
export const formatDateForInput = (date: string | Date | null | undefined): string => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return '';

        return dateObj.toISOString().split('T')[0];
    } catch {
        return '';
    }
};

/**
 * Sanitizes user input to prevent XSS attacks
 * 
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Validates phone number format
 * 
 * @param phone - Phone number string
 * @returns Boolean indicating if phone number is valid
 */
export const isValidPhoneNumber = (phone: string): boolean => {
    // Basic validation - adjust regex based on your requirements
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validates email format
 * 
 * @param email - Email string
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Deep clones an object to prevent mutation
 * 
 * @param obj - Object to clone
 * @returns Deep cloned object
 */
export const deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as any;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item)) as any;
    }

    const cloned = {} as T;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }

    return cloned;
};