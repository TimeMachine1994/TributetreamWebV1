// Define the types for our form data and page load

export interface FormErrors {
  lovedOneName?: string;
  familyContactName?: string;
  familyContactPhone?: string;
  familyContactEmail?: string;
  funeralDirectorName?: string;
  funeralHome?: string;
  memorialLocation?: string;
  memorialDate?: string;
  form?: string;
}

export interface FormData {
  lovedOneName: string;
  familyContactName: string;
  familyContactPhone: string;
  familyContactEmail: string;
  funeralDirectorName: string;
  funeralHome: string;
  memorialLocation: string;
  memorialDate: string;
}

// Simple load function that provides default form data
export const load = async () => {
  console.log('📄 Loading funeral director form page');
  
  return {
    // Initial empty form state
    formData: {
      lovedOneName: '',
      familyContactName: '',
      familyContactPhone: '',
      familyContactEmail: '',
      funeralDirectorName: '',
      funeralHome: '',
      memorialLocation: '',
      memorialDate: ''
    } as FormData
  };
};