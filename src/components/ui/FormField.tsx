"use client";

import { CopyButton } from "@/components/ui/CopyButton";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  highlighted?: boolean;
  className?: string;
  isLoading?: boolean;
}

export function FormField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  highlighted = false,
  className = "",
  isLoading = false,
}: FormFieldProps) {
  // For date inputs, we need to convert ISO date strings to YYYY-MM-DD format
  let displayValue = value;
  if (type === "date" && value && typeof value === 'string' && value.includes('T')) {
    try {
      // Parse the ISO date string
      const date = new Date(value);
      
      // Format as YYYY-MM-DD using the date in local timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      displayValue = `${year}-${month}-${day}`;
    } catch (e) {
      console.error("Error formatting date:", e);
    }
  }
  return (
    <div className={`relative ${className}`}>
      <label className="block">
        <span className={`${highlighted ? "bg-yellow-200" : ""} font-bold`}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
        {isLoading ? (
          <div className="mt-1">
            <SkeletonLoader height="40px" />
          </div>
        ) : (
          <div className="flex mt-1">
            <input
              type={type}
              value={displayValue || ""}
              onChange={(e) => onChange(e.target.value)}
              className="block w-full border-gray-300 border p-2 rounded-l-md"
            />
            <div className="flex items-center bg-gray-100 rounded-r-md px-1">
              <CopyButton value={value || ""} />
            </div>
          </div>
        )}
      </label>
    </div>
  );
}
