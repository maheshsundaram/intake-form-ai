"use client";

import { useFormStore } from "@/store/formStore";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default function FormsPage() {
  const { forms } = useFormStore();

  return (
    <div>
      <Breadcrumb items={[{ label: "Forms", href: "/forms" }]} />
      <div className="p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Form History</h1>
          <Link 
            href="/forms/new" 
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            New Form
          </Link>
        </div>
        
        {forms.length === 0 ? (
          <p>No forms available yet. Create a new form to get started.</p>
        ) : (
          <div className="grid gap-4">
            {forms.map((form) => (
              <Link 
                key={form.id} 
                href={`/forms/${form.id}`}
                className="block p-4 border rounded-md hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">
                      {form.customerName || "Unnamed Customer"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {form.signatureDate ? new Date(form.signatureDate).toLocaleDateString('en-US') : "No date"}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(form.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
