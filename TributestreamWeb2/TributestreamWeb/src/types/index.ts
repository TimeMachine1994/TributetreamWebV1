export interface FormState {
    tributeName: string;
    userFullName: string;
    userEmail: string;
    userPhone: string;
    username: string;
    urlSlug: string;
    tempUrlSlug: string;
  }
  
  export interface UIState {
    currentStep: number;
    isLoading: boolean;
    isEditing: boolean;
    isBlurred: boolean;
  }
  
  export interface ValidationState {
    nameError: string;
    emailError: string;
    phoneError: string;
    generalError: string;
  }
  