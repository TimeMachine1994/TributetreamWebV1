// password-reset.svelte.ts
// State machine for password reset flow

// Define possible states for the password reset flow
const PasswordResetState = {
  INITIAL: 'initial',
  REQUESTING_CODE: 'requesting_code',
  CODE_REQUESTED: 'code_requested',
  VALIDATING_CODE: 'validating_code',
  CODE_VALIDATED: 'code_validated',
  SETTING_PASSWORD: 'setting_password',
  COMPLETED: 'completed',
  ERROR: 'error'
} as const;

// Define possible error types
const ErrorType = {
  REQUEST_ERROR: 'request_error',
  VALIDATION_ERROR: 'validation_error',
  SET_PASSWORD_ERROR: 'set_password_error',
  NETWORK_ERROR: 'network_error'
} as const;

// Define response types for API calls
interface ApiResponse {
  data?: {
    status: number;
  };
  message: string;
  code?: string;
}

class PasswordResetMachine {
  // State
  state = $state<(typeof PasswordResetState)[keyof typeof PasswordResetState]>(PasswordResetState.INITIAL);
  email = $state('');
  code = $state('');
  password = $state('');
  confirmPassword = $state('');
  errorMessage = $state('');
  errorType = $state<(typeof ErrorType)[keyof typeof ErrorType] | null>(null);
  successMessage = $state('');
  isLoading = $state(false);

  // Derived state
  isPasswordMatch = $derived(this.password === this.confirmPassword);
  canRequestCode = $derived(this.email.includes('@') && this.email.includes('.'));
  canValidateCode = $derived(this.email.includes('@') && this.email.includes('.') && this.code.length > 0);
  canSetPassword = $derived(
    this.email.includes('@') && 
    this.email.includes('.') && 
    this.code.length > 0 && 
    this.password.length >= 8 && 
    this.isPasswordMatch
  );

  // Reset the form
  reset() {
    this.state = PasswordResetState.INITIAL;
    this.email = '';
    this.code = '';
    this.password = '';
    this.confirmPassword = '';
    this.errorMessage = '';
    this.errorType = null;
    this.successMessage = '';
    this.isLoading = false;
  }

  // Set email
  setEmail(email: string) {
    this.email = email;
  }

  // Set code
  setCode(code: string) {
    this.code = code;
  }

  // Set password
  setPassword(password: string) {
    this.password = password;
  }

  // Set confirm password
  setConfirmPassword(confirmPassword: string) {
    this.confirmPassword = confirmPassword;
  }

  // Request password reset code
  async requestCode() {
    if (!this.canRequestCode) return;

    this.isLoading = true;
    this.state = PasswordResetState.REQUESTING_CODE;
    this.errorMessage = '';
    this.errorType = null;

    try {
      const response = await fetch('/api/password-reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: this.email })
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        this.errorMessage = data.message || 'Failed to send reset code';
        this.errorType = ErrorType.REQUEST_ERROR;
        this.state = PasswordResetState.ERROR;
        return;
      }

      this.successMessage = data.message;
      this.state = PasswordResetState.CODE_REQUESTED;
    } catch (error) {
      this.errorMessage = 'Network error. Please try again.';
      this.errorType = ErrorType.NETWORK_ERROR;
      this.state = PasswordResetState.ERROR;
    } finally {
      this.isLoading = false;
    }
  }

  // Validate reset code
  async validateCode() {
    if (!this.canValidateCode) return;

    this.isLoading = true;
    this.state = PasswordResetState.VALIDATING_CODE;
    this.errorMessage = '';
    this.errorType = null;

    try {
      const response = await fetch('/api/password-reset/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.email,
          code: this.code
        })
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        this.errorMessage = data.message || 'Invalid reset code';
        this.errorType = ErrorType.VALIDATION_ERROR;
        this.state = PasswordResetState.ERROR;
        return;
      }

      this.successMessage = data.message;
      this.state = PasswordResetState.CODE_VALIDATED;
    } catch (error) {
      this.errorMessage = 'Network error. Please try again.';
      this.errorType = ErrorType.NETWORK_ERROR;
      this.state = PasswordResetState.ERROR;
    } finally {
      this.isLoading = false;
    }
  }

  // Set new password
  async setNewPassword() {
    if (!this.canSetPassword) return;

    this.isLoading = true;
    this.state = PasswordResetState.SETTING_PASSWORD;
    this.errorMessage = '';
    this.errorType = null;

    try {
      const response = await fetch('/api/password-reset/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.email,
          code: this.code,
          password: this.password
        })
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        this.errorMessage = data.message || 'Failed to set new password';
        this.errorType = ErrorType.SET_PASSWORD_ERROR;
        this.state = PasswordResetState.ERROR;
        return;
      }

      this.successMessage = data.message;
      this.state = PasswordResetState.COMPLETED;
    } catch (error) {
      this.errorMessage = 'Network error. Please try again.';
      this.errorType = ErrorType.NETWORK_ERROR;
      this.state = PasswordResetState.ERROR;
    } finally {
      this.isLoading = false;
    }
  }

  // Skip validation and go directly to set password
  skipValidation() {
    this.state = PasswordResetState.CODE_VALIDATED;
  }

  // Go back to previous step
  goBack() {
    switch (this.state) {
      case PasswordResetState.CODE_REQUESTED:
        this.state = PasswordResetState.INITIAL;
        break;
      case PasswordResetState.CODE_VALIDATED:
        this.state = PasswordResetState.CODE_REQUESTED;
        break;
      case PasswordResetState.ERROR:
        // Determine where to go back based on error type
        if (this.errorType === ErrorType.REQUEST_ERROR) {
          this.state = PasswordResetState.INITIAL;
        } else if (this.errorType === ErrorType.VALIDATION_ERROR) {
          this.state = PasswordResetState.CODE_REQUESTED;
        } else if (this.errorType === ErrorType.SET_PASSWORD_ERROR) {
          this.state = PasswordResetState.CODE_VALIDATED;
        } else {
          this.state = PasswordResetState.INITIAL;
        }
        break;
      default:
        this.state = PasswordResetState.INITIAL;
    }
    this.errorMessage = '';
    this.errorType = null;
  }
}

export const passwordResetMachine = new PasswordResetMachine();
export { PasswordResetState, ErrorType };