/**
 * Interface representing the result of form validation
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validates funeral director form data
 * @param data - The form data to validate
 * @returns ValidationResult with validation status and any errors
 */
export function validateFuneralDirectorForm(data: any): ValidationResult {
    const errors: string[] = [];
    
    // Required fields
    if (!data.email) errors.push('Email address is required');
    if (!data.directorFirstName) errors.push('Director\'s first name is required');
    if (!data.directorLastName) errors.push('Director\'s last name is required');
    if (!data.locationName) errors.push('Memorial location name is required');
    if (!data.deceasedFirstName) errors.push('Deceased\'s first name is required');
    if (!data.deceasedLastName) errors.push('Deceased\'s last name is required');
    
    // Email validation
    if (data.email && !isValidEmail(data.email)) {
        errors.push('Invalid email format');
    }
    
    // Phone validation (if provided)
    if (data.phone && !isValidPhone(data.phone)) {
        errors.push('Invalid phone number format');
    }
    
    // Date validations (if provided)
    if (data.deceasedDOB && !isValidDate(data.deceasedDOB)) {
        errors.push('Invalid deceased date of birth');
    }
    
    if (data.deceasedDOP && !isValidDate(data.deceasedDOP)) {
        errors.push('Invalid deceased date of passing');
    }
    
    if (data.memorialDate && !isValidDate(data.memorialDate)) {
        errors.push('Invalid memorial date');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns boolean indicating if email is valid
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates phone number format
 * @param phone - Phone number to validate
 * @returns boolean indicating if phone number is valid
 */
function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[0-9\-\+\(\)\s]{7,20}$/;
    return phoneRegex.test(phone);
}

/**
 * Validates date format
 * @param date - Date string to validate
 * @returns boolean indicating if date is valid
 */
function isValidDate(date: string): boolean {
    const d = new Date(date);
    return !isNaN(d.getTime());
}

/**
 * Validates quick memorial creation form data
 * @param data - The memorial form data to validate
 * @returns ValidationResult with validation status and any errors
 */
export function validateQuickMemorialForm(data: any): ValidationResult {
    const errors: string[] = [];
    
    // Required fields
    if (!data.deceasedName) errors.push('Loved one\'s name is required');
    if (!data.deceasedDOD) errors.push('Date of passing is required');
    if (!data.creatorEmail) errors.push('Email address is required');
    if (!data.tributeMessage) errors.push('Tribute message is required');
    
    // Email validation
    if (data.creatorEmail && !isValidEmail(data.creatorEmail)) {
        errors.push('Invalid email format');
    }
    
    // Message length validation
    if (data.tributeMessage && data.tributeMessage.length < 10) {
        errors.push('Tribute message must be at least 10 characters');
    }
    
    if (data.tributeMessage && data.tributeMessage.length > 1000) {
        errors.push('Tribute message must be less than 1000 characters');
    }
    
    // Date validations (if provided)
    if (data.deceasedDOB && !isValidDate(data.deceasedDOB)) {
        errors.push('Invalid date of birth');
    }
    
    if (data.deceasedDOD && !isValidDate(data.deceasedDOD)) {
        errors.push('Invalid date of passing');
    }
    
    // Ensure date of passing is after date of birth if both are provided
    if (data.deceasedDOB && data.deceasedDOD &&
        isValidDate(data.deceasedDOB) && isValidDate(data.deceasedDOD)) {
        const dob = new Date(data.deceasedDOB);
        const dod = new Date(data.deceasedDOD);
        
        if (dod < dob) {
            errors.push('Date of passing cannot be before date of birth');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}