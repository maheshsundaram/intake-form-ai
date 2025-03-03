"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!capturedImage) {
      setError("No image captured. Please retake the photo.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get the target form ID if it exists
      const targetFormId = localStorage.getItem("targetFormId");

      // Submit the image data and form ID to the API endpoint
      const submissionData = {
        capturedImage: capturedImage,
        targetFormId: targetFormId || null,
      };

      // Submit the data to the API endpoint
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit form data");
      }

      console.log("Image submitted for processing:", result.submissionId);

      // Store the submission ID in localStorage for tracking across devices
      if (result.submissionId) {
        console.log(
          "Storing submission ID in localStorage:",
          result.submissionId
        );
        localStorage.setItem("lastSubmissionId", result.submissionId);
      }

      // Navigate to success page
      router.push("/snap/success");
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Camera", href: "/snap" },
          { label: "Preview", href: "/snap/preview" },
        ]}
      />

      <div className="p-4">
        {capturedImage ? (
          <div className="flex flex-col justify-center rounded-md gap-4">
            <div className="relative h-64 w-full">
              {capturedImage && (
                <Image
                  src={capturedImage}
                  alt="Captured form"
                  fill
                  className="object-contain"
                />
              )}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleRetake}
                variant="outline"
                className="cursor-pointer"
                disabled={isSubmitting}
              >
                Retake Photo
              </Button>

              <Button
                onClick={handleSubmit}
                className={`${
                  isSubmitting
                    ? "bg-blue-400"
                    : "bg-green-600 hover:bg-green-700"
                } cursor-pointer`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Processing...</span>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  </>
                ) : (
                  "Submit Form"
                )}
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
