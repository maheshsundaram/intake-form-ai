"use client";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CameraInterface } from "@/components/camera/CameraInterface";
import { useEffect } from "react";

// Debug logger function with timestamps
const debugLog = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[CameraPage ${timestamp}] ${message}`;
  
  if (data) {
    console.log(formattedMessage, data);
  } else {
    console.log(formattedMessage);
  }
};

export default function CameraPage() {
  // Log page mount
  useEffect(() => {
    debugLog("Camera page mounted");
    
    // Check for formId in URL query parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const formId = urlParams.get('formId');
      
      if (formId) {
        debugLog(`Found formId in URL: ${formId}`);
        // Store the form ID for later use when submitting the image
        localStorage.setItem('targetFormId', formId);
      }
    }
    
    return () => {
      debugLog("Camera page unmounting");
    };
  }, []);
  
  // We'll only clean up when the component unmounts
  useEffect(() => {
    debugLog("Camera page mounted - no cleanup on mount");
    
    return () => {
      debugLog("Camera page unmounting - cleaning up any stray tracks");
      // Only clean up when the component is unmounting
      if (navigator.mediaDevices) {
        try {
          // Get all active media tracks
          navigator.mediaDevices.enumerateDevices()
            .then(devices => {
              debugLog(`Found ${devices.length} devices during cleanup`);
              // We don't need to do anything with the devices here
            })
            .catch(err => {
              debugLog(`Error enumerating devices during cleanup: ${err}`);
            });
        } catch (err) {
          debugLog(`Error in cleanup: ${err}`);
        }
      } else {
        debugLog("navigator.mediaDevices not available for cleanup");
      }
    };
  }, []);
  
  const handleCapture = () => {
    // The CameraInterface component will handle navigation to the preview page
    // This function is here for any additional processing if needed
    debugLog("Image captured callback executed");
  };

  return (
    <div>
      <Breadcrumb 
        items={[
          { label: "Camera", href: "/snap" }
        ]} 
      />
      <CameraInterface onCapture={handleCapture} />
    </div>
  );
}
