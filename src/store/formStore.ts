import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FormData {
  id: string;
  createdAt: Date;
  customerName?: string;
  email?: string;
  cellPhone?: string;
  address?: string;
  homePhone?: string;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  licensePlate?: string;
  mileage?: string;
  warranty?: 'yes' | 'no';
  warrantyProvider?: string;
  knownIssues?: string;
  serviceRequests: Array<{
    area?: string;
    description?: string;
  }>;
  signature?: string; // data:image/jpeg;base64
  signatureDate?: string;
  capturedImage?: string; // Support for storing the captured image
}

// Define processing step type
export type ProcessingStep = 'idle' | 'analyzing' | 'extracting' | 'complete';

interface FormState {
  forms: FormData[];
  currentForm: FormData | null;
  hasUnsavedChanges: boolean;
  isWaitingForPhoto: boolean;
  isProcessing: boolean;
  processingStep: ProcessingStep;
  
  // Actions
  createNewForm: () => void;
  updateForm: (data: Partial<FormData>) => void;
  saveForm: () => void;
  deleteForm: (id: string) => void;
  setCurrentForm: (id: string) => void;
  clearCurrentForm: () => void;
  setWaitingForPhoto: (waiting: boolean) => void;
  receiveMobileSubmission: (data: Partial<FormData>, keepProcessing?: boolean) => void;
  setProcessing: (processing: boolean, step?: ProcessingStep) => void;
}

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
  forms: [],
  currentForm: null,
  hasUnsavedChanges: false,
  isWaitingForPhoto: false,
  isProcessing: false,
  processingStep: 'idle',
  
  createNewForm: () => {
    // Generate a unique form ID that can be used in QR codes
    const formId = `form_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newForm: FormData = {
      id: formId,
      createdAt: new Date(),
      serviceRequests: [{}],
    };
    
    set({
      currentForm: newForm,
      hasUnsavedChanges: true,
    });
    
    // Store the form ID in localStorage for QR code generation
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingFormId', formId);
    }
    
    return formId;
  },
  
  updateForm: (data) => {
    const { currentForm } = get();
    if (!currentForm) return;
    
    set({
      currentForm: { ...currentForm, ...data },
      hasUnsavedChanges: true,
    });
  },
  
  saveForm: () => {
    const { currentForm, forms } = get();
    if (!currentForm) return;
    
    // Check if form already exists
    const existingFormIndex = forms.findIndex(f => f.id === currentForm.id);
    
    if (existingFormIndex >= 0) {
      // Update existing form
      const updatedForms = [...forms];
      updatedForms[existingFormIndex] = currentForm;
      
      set({
        forms: updatedForms,
        hasUnsavedChanges: false,
      });
    } else {
      // Add new form
      set({
        forms: [currentForm, ...forms],
        hasUnsavedChanges: false,
      });
    }
  },
  
  deleteForm: (id) => {
    const { forms, currentForm } = get();
    
    set({
      forms: forms.filter(f => f.id !== id),
      currentForm: currentForm?.id === id ? null : currentForm,
    });
  },
  
  setCurrentForm: (id) => {
    const { forms } = get();
    const form = forms.find(f => f.id === id);
    
    if (form) {
      set({
        currentForm: { ...form },
        hasUnsavedChanges: false,
      });
    }
  },
  
  clearCurrentForm: () => {
    set({
      currentForm: null,
      hasUnsavedChanges: false,
    });
    
    // Clear the pendingFormId from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pendingFormId');
      localStorage.removeItem('lastSubmissionId');
    }
  },
  
  setWaitingForPhoto: (waiting) => {
    set({ isWaitingForPhoto: waiting });
  },
  
  receiveMobileSubmission: (data, keepProcessing = false) => {
    const { currentForm } = get();
    
    if (currentForm) {
      // Update the form with the received data
      set({
        currentForm: { ...currentForm, ...data },
        hasUnsavedChanges: true,
        isProcessing: keepProcessing, // Only clear processing if explicitly requested
        processingStep: keepProcessing ? get().processingStep : 'complete',
        isWaitingForPhoto: keepProcessing, // Only keep waiting if still processing
      });
      
      // Show a toast notification (in a real app)
      console.log("Form data received from mobile submission:", data);
      
      // Only show notification if processing is complete
      if (!keepProcessing && typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Form Data Received', {
            body: 'The form has been auto-filled with the submitted data.'
          });
        }
      }
    }
  },
  
  setProcessing: (processing, step = 'idle') => {
    set({ 
      isProcessing: processing,
      processingStep: step 
    });
  },
    }),
    {
      name: 'form-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        forms: state.forms,
        // Don't persist these states
        currentForm: null,
        hasUnsavedChanges: false,
        isWaitingForPhoto: false
      }),
    }
  )
);
