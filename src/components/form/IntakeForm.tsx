"use client";

import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { ImageViewer } from "@/components/ui/ImageViewer";
import { CopyButton } from "@/components/ui/CopyButton";
import { SkeletonLoader, SkeletonImage } from "@/components/ui/SkeletonLoader";
import { useFormStore } from "@/store/formStore";
import { Image } from "lucide-react";
import NextImage from "next/image";

export function IntakeForm() {
  const { 
    currentForm, 
    updateForm, 
    isProcessing,
    processingStep
  } = useFormStore();
  
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);


  const handleUpdateField = (field: string, value: string | string[] | boolean) => {
    if (!currentForm) return;
    updateForm({ [field]: value });
  };

  const handleUpdateServiceRequest = (index: number, field: string, value: string) => {
    if (!currentForm || !currentForm.serviceRequests) return;
    
    const updatedRequests = [...currentForm.serviceRequests];
    if (!updatedRequests[index]) {
      updatedRequests[index] = {};
    }
    
    updatedRequests[index] = {
      ...updatedRequests[index],
      [field]: value
    };
    
    updateForm({ serviceRequests: updatedRequests });
  };

  const handleAddServiceRequest = () => {
    if (!currentForm || !currentForm.serviceRequests) return;
    
    const updatedRequests = [...currentForm.serviceRequests, {}];
    updateForm({ serviceRequests: updatedRequests });
  };

  const handleRemoveServiceRequest = (index: number) => {
    if (!currentForm || !currentForm.serviceRequests) return;
    if (currentForm.serviceRequests.length <= 1) return;
    
    const updatedRequests = currentForm.serviceRequests.filter((_, i) => i !== index);
    updateForm({ serviceRequests: updatedRequests });
  };



  if (!currentForm) {
    return <div>No form selected</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {currentForm?.capturedImage && (
        <ImageViewer 
          imageUrl={currentForm.capturedImage}
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
        />
      )}
      
      <form onSubmit={(e) => e.preventDefault()} className="p-8">
        {/* Image thumbnail if available */}
        {currentForm?.capturedImage && (
          <div className="mb-6 border p-4 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <h3 className="font-bold">Captured Form Image</h3>
                {isProcessing && (
                  <span className="ml-2 inline-block bg-blue-600 text-white px-2 py-1 rounded-md text-xs animate-pulse">
                    {processingStep === 'analyzing' ? 'AI Analyzing Image...' : 
                     processingStep === 'extracting' ? 'Extracting Form Data...' : 
                     'Processing Complete'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsImageViewerOpen(true)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <Image className="h-4 w-4" aria-hidden="true" />
                <span>View Full Image</span>
              </button>
            </div>
            {isProcessing ? (
              <SkeletonImage />
            ) : (
              <div className="flex justify-center border rounded-md overflow-hidden bg-gray-100">
                <div className="relative h-40 w-full">
                  {currentForm.capturedImage && (
                    <NextImage 
                      src={currentForm.capturedImage}
                      alt="Captured form image"
                      fill
                      className="object-contain cursor-pointer"
                      onClick={() => setIsImageViewerOpen(true)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Customer Information Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <FormField
            label="Customer Name:"
            value={currentForm.customerName || ""}
            onChange={(value) => handleUpdateField("customerName", value)}
            highlighted={true}
            className="col-span-1"
            isLoading={isProcessing}
          />
          <FormField
            label="Email:"
            value={currentForm.email || ""}
            onChange={(value) => handleUpdateField("email", value)}
            type="email"
            highlighted={true}
            className="col-span-1"
            isLoading={isProcessing}
          />
          <FormField
            label="Cell #:"
            value={currentForm.cellPhone || ""}
            onChange={(value) => handleUpdateField("cellPhone", value)}
            type="tel"
            highlighted={true}
            className="col-span-1"
            isLoading={isProcessing}
          />
          <FormField
            label="Street Address:"
            value={currentForm.address || ""}
            onChange={(value) => handleUpdateField("address", value)}
            highlighted={true}
            className="col-span-1"
            isLoading={isProcessing}
          />
          <FormField
            label="Home#:"
            value={currentForm.homePhone || ""}
            onChange={(value) => handleUpdateField("homePhone", value)}
            type="tel"
            className="col-span-1"
            isLoading={isProcessing}
          />
        </div>

        {/* Vehicle Information Section */}
        <h2 className="text-xl font-bold mb-4">Vehicle Information</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <FormField
            label="Year:"
            value={currentForm.vehicleYear || ""}
            onChange={(value) => handleUpdateField("vehicleYear", value)}
            className="col-span-1"
            isLoading={isProcessing}
          />
          <FormField
            label="Make:"
            value={currentForm.vehicleMake || ""}
            onChange={(value) => handleUpdateField("vehicleMake", value)}
            className="col-span-1"
            isLoading={isProcessing}
          />
          <FormField
            label="Model:"
            value={currentForm.vehicleModel || ""}
            onChange={(value) => handleUpdateField("vehicleModel", value)}
            className="col-span-1"
            isLoading={isProcessing}
          />
          <FormField
            label="Color:"
            value={currentForm.vehicleColor || ""}
            onChange={(value) => handleUpdateField("vehicleColor", value)}
            className="col-span-1"
            isLoading={isProcessing}
          />
          <FormField
            label="License Plate:"
            value={currentForm.licensePlate || ""}
            onChange={(value) => handleUpdateField("licensePlate", value)}
            highlighted={true}
            className="col-span-1"
            isLoading={isProcessing}
          />
          <FormField
            label="Exact Mileage:"
            value={currentForm.mileage || ""}
            onChange={(value) => handleUpdateField("mileage", value)}
            highlighted={true}
            className="col-span-1"
            isLoading={isProcessing}
          />
        </div>

        {/* Warranty Section */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="font-bold mr-2">Extended Warranty?</span>
            <label className="inline-flex items-center mr-2">
              <input 
                type="radio" 
                name="warranty" 
                value="yes" 
                className="mr-1"
                checked={currentForm.warranty === "yes"}
                onChange={() => handleUpdateField("warranty", "yes")}
              />
              <span>YES</span>
            </label>
            <label className="inline-flex items-center mr-2">
              <input 
                type="radio" 
                name="warranty" 
                value="no" 
                className="mr-1"
                checked={currentForm.warranty === "no"}
                onChange={() => handleUpdateField("warranty", "no")}
              />
              <span>NO</span>
            </label>
            <span className="font-bold ml-4 mr-2">Provider:</span>
            <input 
              type="text" 
              className="border-gray-300 border p-1 flex-grow"
              value={currentForm.warrantyProvider || ""}
              onChange={(e) => handleUpdateField("warrantyProvider", e.target.value)}
            />
          </div>
        </div>

        {/* Known Issues Section */}
        <div className="mb-6">
          <label className="block">
            <span className="font-bold">Known Issues with Vehicle:</span>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 border p-2"
              value={currentForm.knownIssues || ""}
              onChange={(e) => handleUpdateField("knownIssues", e.target.value)}
            />
          </label>
        </div>

        {/* Service Requests Section */}
        <p className="text-blue-800 font-bold text-center mb-4">
          *Please fill each concern/service being requested separately below*
        </p>

        {currentForm.serviceRequests && currentForm.serviceRequests.map((request, index) => (
          <div className="mb-6" key={index}>
            <div className={`${index === 0 ? "bg-yellow-200" : ""} font-bold mb-2 flex justify-between`}>
              <span>Vehicle Service #{index + 1}</span>
              {index > 0 && (
                <button 
                  type="button" 
                  onClick={() => handleRemoveServiceRequest(index)}
                  className="text-red-500 text-sm cursor-pointer hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1 border p-4">
                <p className="mb-2">What Area of Vehicle?</p>
                {isProcessing ? (
                  <SkeletonLoader height="40px" />
                ) : (
                  <div className="flex">
                    <input
                      type="text"
                      className="w-full border-gray-300 border p-2 rounded-l-md"
                      value={request.area || ""}
                      onChange={(e) => handleUpdateServiceRequest(index, "area", e.target.value)}
                    />
                    <div className="flex items-center bg-gray-100 rounded-r-md px-1">
                      <CopyButton value={request.area || ""} />
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-1 border p-4">
                <p className="mb-2">Description of Issue:</p>
                {isProcessing ? (
                  <SkeletonLoader height="40px" />
                ) : (
                  <div className="flex">
                    <input
                      type="text"
                      className="w-full border-gray-300 border p-2 rounded-l-md"
                      value={request.description || ""}
                      onChange={(e) => handleUpdateServiceRequest(index, "description", e.target.value)}
                    />
                    <div className="flex items-center bg-gray-100 rounded-r-md px-1">
                      <CopyButton value={request.description || ""} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddServiceRequest}
          className="bg-blue-600 text-white py-2 px-4 rounded-md mb-6 cursor-pointer hover:bg-blue-700"
        >
          Add Another Service Request
        </button>

        {/* Authorization Text */}
        <div className="mb-6">
          <h2 className="font-bold text-center mb-4">
            Repair Authorization & Vehicle Depositary Receipt (AB 409 AMENDING CIVIL CODE)
          </h2>
          <p className="text-sm mb-4">
            I hereby authorize the work to be done along with the necessary materials. You and your employees may operate vehicles for purposes of testing, inspection, or delivery at my risk. An express mechanic&apos;s lien is acknowledged on vehicles to secure the amount of repairs thereto. In the event legal action is necessary to enforce this contract, I will pay reasonable attorney&apos;s fees and court costs. I acknowledge this deposited property is not insured or protected to the amount of actual cash value thereof by the dealer against loss occasioned by theft, fire, and vandalism while such property remains within the depositary. I also acknowledge no articles of personal property remain with the depositary. I also acknowledge no articles of personal property have been left in the vehicle and the dealer is not responsible for inspection. Signing puts signee in agreement with Professional Automotive Service policies.
          </p>
        </div>

        {/* Signature Section */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Signature:"
            value={currentForm.signature || ""}
            onChange={(value) => handleUpdateField("signature", value)}
            highlighted={true}
            className="col-span-1"
            isLoading={isProcessing}
          />
          <FormField
            label="Date:"
            value={currentForm.signatureDate || ""}
            onChange={(value) => {
              // When user changes the date, convert it to ISO format
              if (value) {
                try {
                  // Parse the date from YYYY-MM-DD format
                  const [year, month, day] = value.split('-').map(Number);
                  
                  // Create date at noon UTC to avoid timezone issues
                  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
                  
                  if (!isNaN(date.getTime())) {
                    handleUpdateField("signatureDate", date.toISOString());
                    return;
                  }
                } catch (e) {
                  console.error("Error parsing date:", e);
                }
              }
              // Fallback to storing the raw value
              handleUpdateField("signatureDate", value);
            }}
            type="date"
            highlighted={true}
            className="col-span-1"
            isLoading={isProcessing}
          />
        </div>

        {/* Form Actions removed from here and moved to sticky header */}
      </form>
    </div>
  );
}
