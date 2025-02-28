"use client";

interface SkeletonLoaderProps {
  className?: string;
  width?: string;
  height?: string;
}

export function SkeletonLoader({ className = "", width = "100%", height = "20px" }: SkeletonLoaderProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonField() {
  return (
    <div className="w-full">
      <div className="animate-pulse bg-gray-200 h-4 w-1/4 mb-2 rounded"></div>
      <div className="animate-pulse bg-gray-200 h-10 w-full rounded"></div>
    </div>
  );
}

export function SkeletonImage() {
  return (
    <div className="flex justify-center border rounded-md overflow-hidden bg-gray-100 h-40">
      <div className="animate-pulse bg-gray-200 w-full h-full"></div>
    </div>
  );
}
