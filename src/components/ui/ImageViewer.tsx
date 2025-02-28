"use client";

import { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";

interface ImageViewerProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageViewer({ imageUrl, isOpen, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  
  // Reset scale when modal opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full h-full max-w-4xl max-h-[90vh] mx-auto p-4">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-lg cursor-pointer"
        >
          <X className="h-6 w-6" />
        </button>
        
        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 z-10 flex gap-2">
          <button 
            onClick={handleZoomOut}
            className="bg-white rounded-full p-2 shadow-lg cursor-pointer"
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-6 w-6" />
          </button>
          <button 
            onClick={handleZoomIn}
            className="bg-white rounded-full p-2 shadow-lg cursor-pointer"
            disabled={scale >= 3}
          >
            <ZoomIn className="h-6 w-6" />
          </button>
        </div>
        
        {/* Image container with overflow for large images */}
        <div className="w-full h-full overflow-auto flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt="Form image" 
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </div>
  );
}
