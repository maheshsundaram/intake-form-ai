import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FormData {
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
  signature?: string;
  signatureDate?: string;
  capturedImage?: string; // Support for storing the captured image
}

interface FormState {
  forms: FormData[];
  currentForm: FormData | null;
  hasUnsavedChanges: boolean;
  isWaitingForPhoto: boolean;
  isProcessing: boolean;
  processingStep: 'idle' | 'analyzing' | 'extracting' | 'complete';
  
  // Actions
  createNewForm: () => void;
  updateForm: (data: Partial<FormData>) => void;
  saveForm: () => void;
  deleteForm: (id: string) => void;
  setCurrentForm: (id: string) => void;
  clearCurrentForm: () => void;
  setWaitingForPhoto: (waiting: boolean) => void;
  receiveMobileSubmission: (data: Partial<FormData>) => void;
  setProcessing: (processing: boolean) => void;
  setProcessingStep: (step: 'idle' | 'analyzing' | 'extracting' | 'complete') => void;
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
    const newForm: FormData = {
      id: Date.now().toString(),
      createdAt: new Date(),
      serviceRequests: [{}],
    };
    
    set({
      currentForm: newForm,
      hasUnsavedChanges: true,
    });
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
  },
  
  setWaitingForPhoto: (waiting) => {
    set({ isWaitingForPhoto: waiting });
  },
  
  receiveMobileSubmission: (data) => {
    const { currentForm } = get();
    
    if (currentForm) {
      // Start processing
      set({
        isProcessing: true,
        processingStep: 'analyzing',
        isWaitingForPhoto: false,
      });
      
      // Simulate AI processing steps
      setTimeout(() => {
        set({ processingStep: 'extracting' });
        
        // After another delay, complete the process and update the form
        setTimeout(() => {
          set({
            currentForm: { ...currentForm, ...data },
            hasUnsavedChanges: true,
            isProcessing: false,
            processingStep: 'complete',
          });
          
          // Show a toast notification (in a real app)
          console.log("Form data received from mobile submission:", data);
          
          // You could trigger a browser notification here
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification('Form Data Received', {
                body: 'The form has been auto-filled with the submitted data.'
              });
            }
          }
        }, 1500);
      }, 1000);
    }
  },
  
  setProcessing: (processing) => {
    set({ isProcessing: processing });
  },
  
  setProcessingStep: (step) => {
    set({ processingStep: step });
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
