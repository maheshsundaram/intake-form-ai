"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/button";
import { useFormStore } from "@/store/formStore";
import { submitMockData } from "@/lib/mockSubmission";

export default function PreviewPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Retrieve the captured image from localStorage
    const imageData = localStorage.getItem("capturedImage");
    if (imageData) {
      setCapturedImage(imageData);
    } else {
      // If no image is found, redirect back to the camera page
      router.push("/snap");
    }
  }, [router]);

  const handleRetake = () => {
    // Clear the stored image and return to camera
    localStorage.removeItem("capturedImage");
    
    // Force a full page reload to ensure camera resources are properly released
    window.location.href = "/snap";
  };

  const handleSubmit = async () => {
    try {
      // In a real app, we would upload the image and form data to a server
      // For the MVP, we'll just use mock data
      const mockData = await submitMockData();
      
      // Create a new object with the mock data and captured image
      const submissionData = {
        ...mockData,
        capturedImage: capturedImage || ""
      };
      
      // Submit the data to the API endpoint
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form data');
      }
      
      console.log("Form data submitted:", mockData);
      
      // Navigate to success page
      router.push("/snap/success");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div>
      <Breadcrumb 
        items={[
          { label: "Camera", href: "/snap" },
          { label: "Preview", href: "/snap/preview" }
        ]} 
      />
      
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Photo Preview</h1>
        
        {capturedImage ? (
          <div className="flex flex-col items-center">
            <div className="bg-white p-2 rounded-md shadow-md mb-6 max-w-md">
              <img 
                src={capturedImage} 
                alt="Captured form" 
                className="w-full h-auto rounded"
              />
            </div>
            
            <div className="flex gap-4">
              <Button
                onClick={handleRetake}
                variant="outline"
                className="cursor-pointer"
              >
                Retake Photo
              </Button>
              
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 cursor-pointer"
              >
                Submit Form
              </Button>
            </div>
          </div>
        ) : (
          <p>Loading preview...</p>
        )}
      </div>
    </div>
  );
}
