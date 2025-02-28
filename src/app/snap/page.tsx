"use client";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CameraInterface } from "@/components/camera/CameraInterface";
import { useEffect } from "react";

export default function CameraPage() {
  // Clean up any existing camera resources when this page loads
  useEffect(() => {
    return () => {
      // Force cleanup of any existing MediaStream tracks
      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({ audio: false, video: false })
          .then(stream => stream.getTracks().forEach(track => track.stop()))
          .catch(() => {});
      }
    };
  }, []);
  
  const handleCapture = () => {
    // The CameraInterface component will handle navigation to the preview page
    // This function is here for any additional processing if needed
    console.log("Image captured");
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
