"use client";

import { useEffect } from "react";
import React, { use } from "react";
import { IntakeForm } from "@/components/form/IntakeForm";
import { useFormStore } from "@/store/formStore";
import { useRouter } from "next/navigation";
import { FormActions } from "@/components/ui/FormActions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default function FormDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const { setCurrentForm, currentForm, forms } = useFormStore();
  const router = useRouter();
  
  useEffect(() => {
    // Check if form exists
    const formExists = forms.some(form => form.id === id);
    
    if (!formExists) {
      router.push("/forms");
      return;
    }
    
    // Set current form if it's not already set or if it's a different form
    if (!currentForm || currentForm.id !== id) {
      setCurrentForm(id);
    }
  }, [id, setCurrentForm, currentForm, forms, router]);

  // Get customer name and date for breadcrumb
  const customerName = currentForm?.customerName || "Unnamed Customer";
  const formDate = currentForm?.signatureDate 
    ? new Date(currentForm.signatureDate).toLocaleDateString('en-US') 
    : "No date";
  
  // Check if form has an image
  const hasImage = currentForm?.capturedImage ? true : false;
  
  return (
    <div>
      <Breadcrumb 
        items={[
          { label: "Forms", href: "/forms" },
          { label: `${customerName}, ${formDate}`, href: `/forms/${id}` }
        ]}
      >
        <FormActions
          isNew={false}
          hasChanges={useFormStore.getState().hasUnsavedChanges}
          onSave={() => {
            useFormStore.getState().saveForm();
          }}
          onDiscard={() => {
            // Just reload the form data, don't navigate away
            if (currentForm) {
              useFormStore.getState().setCurrentForm(currentForm.id);
            }
          }}
          onDelete={() => {
            if (currentForm) {
              useFormStore.getState().deleteForm(currentForm.id);
              router.push('/forms');
            }
          }}
          hideDiscard={false}
        />
      </Breadcrumb>
      <IntakeForm />
    </div>
  );
}
