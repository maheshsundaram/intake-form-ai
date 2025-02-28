"use client";

import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default function SuccessPage() {
  return (
    <div>
      <Breadcrumb 
        items={[
          { label: "Camera", href: "/snap" },
          { label: "Success", href: "/snap/success" }
        ]} 
      />
      <div className="p-4">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-2xl font-bold mb-4">Form Submitted!</h1>
        <p className="mb-6">Your form has been successfully submitted.</p>
        <button 
          onClick={() => {
            // Force a full page reload to ensure camera resources are properly released
            window.location.href = "/snap";
          }}
          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors cursor-pointer"
        >
          Take Another Photo
        </button>
        </div>
      </div>
    </div>
  );
}
