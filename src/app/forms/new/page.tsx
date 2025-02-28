"use client";

import { useEffect } from "react";
import { IntakeForm } from "@/components/form/IntakeForm";
import { useFormStore } from "@/store/formStore";
import { useRouter } from "next/navigation";
import { FormActions } from "@/components/ui/FormActions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { QRCode } from "@/components/ui/QRCode";
import { usePolling } from "@/lib/usePolling";

export default function NewFormPage() {
  const { createNewForm, currentForm, clearCurrentForm } = useFormStore();
  
  useEffect(() => {
    // Always clear the current form when navigating to the new form page
    clearCurrentForm();
    // Then create a new form
    createNewForm();
  }, [clearCurrentForm, createNewForm]);

  const router = useRouter();
  const hasUnsavedChanges = useFormStore((state) => state.hasUnsavedChanges);
  
  // Start polling automatically
  const { hasReceived } = usePolling(true);

  return (
    <div>
      <Breadcrumb 
        items={[
          { label: "Forms", href: "/forms" },
          { label: "New Form", href: "/forms/new" }
        ]}
      >
        {hasReceived && (
          <FormActions
            isNew={true}
            hasChanges={hasUnsavedChanges}
            onSave={() => {
              // Set default date to today if it's not already set
              if (currentForm && !currentForm.signatureDate) {
                const today = new Date().toISOString().split('T')[0];
                useFormStore.getState().updateForm({ signatureDate: today });
              }
              
              useFormStore.getState().saveForm();
              
              // Redirect to the form's detail page
              if (currentForm) {
                router.push(`/forms/${currentForm.id}`);
              }
            }}
            onDiscard={() => {
              // Just revert changes, don't navigate away
              if (currentForm) {
                // For a new form, recreate it
                clearCurrentForm();
                createNewForm();
              }
            }}
            hideDiscard={true}
          />
        )}
      </Breadcrumb>
      
      {!hasReceived ? (
        <div className="bg-blue-50 p-6 mb-6 rounded-lg">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <QRCode url={`${window.location.origin}/snap`} />
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-4">Scan QR Code to Take a Photo</h2>
              <p className="mb-4">
                Use your mobile device to scan this QR code and take a photo of the handwritten form.
              </p>
              <div className="bg-yellow-100 p-4 rounded-md">
                <p className="font-medium">Waiting for photo submission...</p>
                <p className="text-sm text-gray-600 mt-2">
                  The form will be auto-filled when a photo is submitted.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${useFormStore.getState().isProcessing ? 'bg-blue-100' : 'bg-green-100'} p-4 rounded-md mb-6`}>
          {useFormStore.getState().isProcessing ? (
            <>
              <div className="flex items-center">
                <p className="font-medium text-blue-800">
                  {useFormStore.getState().processingStep === 'analyzing' ? 'AI Analyzing Image...' : 
                   useFormStore.getState().processingStep === 'extracting' ? 'Extracting Form Data...' : 
                   'Processing Complete'}
                </p>
                <div className="ml-2 h-2 w-2 bg-blue-600 rounded-full animate-ping"></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Our AI is processing the image to extract form data...
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-green-800">Form data received!</p>
              <p className="text-sm text-gray-600 mt-2">
                The form has been auto-filled with the submitted data.
              </p>
            </>
          )}
        </div>
      )}
      
      {hasReceived && <IntakeForm />}
    </div>
  );
}
