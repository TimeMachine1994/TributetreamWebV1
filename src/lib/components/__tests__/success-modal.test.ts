import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import SuccessModal from '../success-modal.svelte';

// Mock the $app/navigation module
vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}));

import { goto } from '$app/navigation';

describe('SuccessModal', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should not render when show is false', () => {
    const { queryByRole } = render(SuccessModal, { 
      props: { 
        show: false,
        message: 'Test message' 
      } 
    });
    
    expect(queryByRole('dialog')).toBeNull();
  });

  it('should render with the correct message when show is true', () => {
    const { getByText, getByRole } = render(SuccessModal, { 
      props: { 
        show: true,
        message: 'Test success message' 
      } 
    });
    
    expect(getByRole('dialog')).toBeTruthy();
    expect(getByText('Test success message')).toBeTruthy();
  });

  it('should render with custom title when provided', () => {
    const { getByText } = render(SuccessModal, { 
      props: { 
        show: true,
        title: 'Custom Title',
        message: 'Test message' 
      } 
    });
    
    expect(getByText('Custom Title')).toBeTruthy();
  });

  it('should call goto with redirectUrl when close button is clicked', async () => {
    const { getByRole } = render(SuccessModal, { 
      props: { 
        show: true,
        message: 'Test message',
        redirectUrl: '/custom-redirect'
      } 
    });
    
    const closeButton = getByRole('button', { name: 'Close modal' });
    await fireEvent.click(closeButton);
    
    expect(goto).toHaveBeenCalledWith('/custom-redirect');
  });

  it('should call goto with default redirectUrl when not specified', async () => {
    const { getByText } = render(SuccessModal, { 
      props: { 
        show: true,
        message: 'Test message'
      } 
    });
    
    const closeButton = getByText('Close');
    await fireEvent.click(closeButton);
    
    expect(goto).toHaveBeenCalledWith('/');
  });

  it('should close when clicking the backdrop', async () => {
    const { getByRole } = render(SuccessModal, { 
      props: { 
        show: true,
        message: 'Test message'
      } 
    });
    
    const dialog = getByRole('dialog');
    await fireEvent.click(dialog);
    
    expect(goto).toHaveBeenCalledWith('/');
  });

  it('should handle Escape key to close the modal', async () => {
    render(SuccessModal, { 
      props: { 
        show: true,
        message: 'Test message'
      } 
    });
    
    // Simulate pressing the Escape key
    await fireEvent.keyDown(window, { key: 'Escape' });
    
    expect(goto).toHaveBeenCalledWith('/');
  });

  it('should not respond to Escape key when modal is not shown', async () => {
    render(SuccessModal, { 
      props: { 
        show: false,
        message: 'Test message'
      } 
    });
    
    // Simulate pressing the Escape key
    await fireEvent.keyDown(window, { key: 'Escape' });
    
    expect(goto).not.toHaveBeenCalled();
  });
});