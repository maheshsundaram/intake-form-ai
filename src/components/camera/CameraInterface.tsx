"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

interface CameraInterfaceProps {
  onCapture: (imageData: string) => void;
}

export function CameraInterface({ onCapture }: CameraInterfaceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    let currentStream: MediaStream | null = null;
    
    // Access the device camera
    const startCamera = async () => {
      try {
        // Check if mediaDevices is available
        if (!navigator.mediaDevices) {
          throw new Error("Media devices API is not supported in your browser");
        }
        
        // First check if we have permissions
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasVideoPermissions = devices.some(device => 
            device.kind === 'videoinput' && device.label !== ''
          );
          
          // If we don't have permissions yet, show a message to the user
          if (!hasVideoPermissions) {
            console.log("Requesting camera permissions...");
            // We'll still try to access the camera, which will trigger the permission prompt
          }
        } catch (permErr) {
          console.error("Error checking permissions:", permErr);
        }
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        
        // Only set state if component is still mounted
        if (mounted) {
          setStream(mediaStream);
          currentStream = mediaStream;
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } else {
          // If component unmounted during getUserMedia call, clean up the stream
          mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (mounted) {
          setError(
            "Camera access denied. Please grant camera permissions by clicking the camera icon in your browser's address bar and refreshing the page."
          );
        }
      }
    };

    startCamera();

    // Cleanup function to stop the camera when component unmounts
    return () => {
      mounted = false;
      
      // Stop all tracks in the stream
      if (currentStream) {
        currentStream.getTracks().forEach(track => {
          track.stop();
        });
      }
      
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }
      
      // Also clear the video source
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject = null;
      }
    };
  }, []); // Keep empty dependency array to prevent re-initialization

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const imageData = canvas.toDataURL("image/jpeg");
        
        // Call the onCapture callback with the image data
        onCapture(imageData);
        
        // Store the image data in localStorage for the preview page
        localStorage.setItem("capturedImage", imageData);
        
        // Navigate to the preview page
        router.push("/snap/preview");
      }
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-4">
        <div className="bg-red-100 p-4 rounded-md text-red-800 mb-4">
          <p>{error}</p>
          <div className="mt-4">
            <p className="font-bold">How to enable camera access:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Look for the camera icon in your browser's address bar</li>
              <li>Click it and select "Allow" for camera access</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white py-2 px-4 rounded-md"
          >
            Refresh Page
          </button>
          <button 
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white py-2 px-4 rounded-md"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[80vh] w-full overflow-hidden bg-black">
      {/* Video element for camera feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        className="h-full w-full object-cover"
      />
      
      {/* Canvas for capturing the image (hidden) */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Form outline overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-[90%] h-[80%] mx-auto my-[10%] border-2 border-white border-dashed opacity-70 rounded-md">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center bg-black bg-opacity-50 p-2 rounded">
            <p>Align form within the box</p>
          </div>
        </div>
      </div>
      
      {/* Floating capture button */}
      <button
        onClick={captureImage}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-6 shadow-lg cursor-pointer"
        aria-label="Take photo"
      >
        <Camera className="h-8 w-8 text-blue-600" />
      </button>
    </div>
  );
}
