import { describe, it, expect } from 'vitest';
import { validateFuneralDirectorForm, validateSimplifiedMemorialForm } from '../form-validation';

describe('validateFuneralDirectorForm', () => {
  it('should validate a valid form', () => {
    const validForm = {
      email: 'test@example.com',
      directorFirstName: 'John',
      directorLastName: 'Doe',
      deceasedFirstName: 'Jane',
      deceasedLastName: 'Smith',
      phone: '123-456-7890'
    };
    
    const result = validateFuneralDirectorForm(validForm);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('should return errors for invalid form', () => {
    const invalidForm = {
      email: 'invalid-email',
      directorFirstName: '',
      directorLastName: 'Doe',
      deceasedFirstName: 'Jane',
      deceasedLastName: '',
      phone: '123'
    };
    
    const result = validateFuneralDirectorForm(invalidForm);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors).toContain('Director\'s first name is required');
    expect(result.errors).toContain('Deceased\'s last name is required');
    expect(result.errors).toContain('Invalid email format');
    expect(result.errors).toContain('Invalid phone number format');
  });

  it('should validate optional date fields when provided', () => {
    const formWithInvalidDates = {
      email: 'test@example.com',
      directorFirstName: 'John',
      directorLastName: 'Doe',
      deceasedFirstName: 'Jane',
      deceasedLastName: 'Smith',
      phone: '123-456-7890',
      deceasedDOB: 'invalid-date',
      deceasedDOP: '2023-13-45', // Invalid date
      memorialDate: 'tomorrow' // Invalid date format
    };
    
    const result = validateFuneralDirectorForm(formWithInvalidDates);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid deceased date of birth');
    expect(result.errors).toContain('Invalid deceased date of passing');
    expect(result.errors).toContain('Invalid memorial date');
  });

  it('should accept valid date fields', () => {
    const formWithValidDates = {
      email: 'test@example.com',
      directorFirstName: 'John',
      directorLastName: 'Doe',
      deceasedFirstName: 'Jane',
      deceasedLastName: 'Smith',
      phone: '123-456-7890',
      deceasedDOB: '1950-01-01',
      deceasedDOP: '2023-01-15',
      memorialDate: '2023-02-01'
    };
    
    const result = validateFuneralDirectorForm(formWithValidDates);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validateSimplifiedMemorialForm', () => {
  it('should validate a valid simplified memorial form', () => {
    const validForm = {
      lovedOneName: 'Jane Smith',
      creatorFullName: 'John Doe',
      creatorPhone: '123-456-7890',
      creatorEmail: 'john@example.com'
    };
    
    const result = validateSimplifiedMemorialForm(validForm);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('should return errors for invalid simplified memorial form', () => {
    const invalidForm = {
      lovedOneName: '',
      creatorFullName: 'John Doe',
      creatorPhone: '123', // Invalid phone
      creatorEmail: 'not-an-email' // Invalid email
    };
    
    const result = validateSimplifiedMemorialForm(invalidForm);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors).toContain('Loved one\'s name is required');
    expect(result.errors).toContain('Invalid email format');
    expect(result.errors).toContain('Invalid phone number format');
  });
});