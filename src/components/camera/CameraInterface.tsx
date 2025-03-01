"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

// Debug logger function with timestamps
const debugLog = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[CameraInterface ${timestamp}] ${message}`;
  
  if (data) {
    console.log(formattedMessage, data);
  } else {
    console.log(formattedMessage);
  }
};

interface CameraInterfaceProps {
  onCapture: (imageData: string) => void;
}

export function CameraInterface({ onCapture }: CameraInterfaceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [componentId] = useState(`cam_${Math.random().toString(36).substring(2, 9)}`);
  const [mountTime] = useState(new Date().toISOString());
  
  // Log component mount
  useEffect(() => {
    debugLog(`Component mounted. ID: ${componentId}, Mount time: ${mountTime}`);
    
    return () => {
      debugLog(`Component unmounting. ID: ${componentId}, Lived for: ${(new Date().getTime() - new Date(mountTime).getTime()) / 1000}s`);
    };
  }, [componentId, mountTime]);

  useEffect(() => {
    debugLog(`Camera effect running. Component ID: ${componentId}`);
    
    let mounted = true;
    let currentStream: MediaStream | null = null;
    const currentVideoRef = videoRef.current;
    
    // Access the device camera
    const startCamera = async () => {
      debugLog(`Starting camera. Component ID: ${componentId}`);
      try {
        // Check if mediaDevices is available
        if (!navigator.mediaDevices) {
          debugLog(`Media devices API not supported. Component ID: ${componentId}`);
          throw new Error("Media devices API is not supported in your browser");
        }
        
        // First check if we have permissions
        try {
          debugLog(`Enumerating devices. Component ID: ${componentId}`);
          const devices = await navigator.mediaDevices.enumerateDevices();
          debugLog(`Devices found: ${devices.length}`, devices);
          
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          debugLog(`Video devices found: ${videoDevices.length}`, videoDevices);
          
          const hasVideoPermissions = devices.some(device => 
            device.kind === 'videoinput' && device.label !== ''
          );
          
          // If we don't have permissions yet, show a message to the user
          if (!hasVideoPermissions) {
            debugLog(`No video permissions yet. Component ID: ${componentId}`);
            // We'll still try to access the camera, which will trigger the permission prompt
          } else {
            debugLog(`Video permissions already granted. Component ID: ${componentId}`);
          }
        } catch (permErr) {
          debugLog(`Error checking permissions: ${permErr}. Component ID: ${componentId}`, permErr);
          console.error("Error checking permissions:", permErr);
        }
        
        debugLog(`Requesting camera access. Component ID: ${componentId}`);
        const constraints = {
          video: { facingMode: "environment" },
          audio: false,
        };
        debugLog(`Using constraints:`, constraints);
        
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        debugLog(`Camera access granted. Component ID: ${componentId}. Tracks:`, mediaStream.getTracks());
        
        // Only set state if component is still mounted
        if (mounted) {
          debugLog(`Component still mounted, setting stream. Component ID: ${componentId}`);
          setStream(mediaStream);
          currentStream = mediaStream;
          
          if (videoRef.current) {
            debugLog(`Setting video srcObject. Component ID: ${componentId}`);
            videoRef.current.srcObject = mediaStream;
            
            videoRef.current.onloadedmetadata = () => {
              debugLog(`Video metadata loaded. Component ID: ${componentId}. Dimensions: ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`);
            };
            
            videoRef.current.onplay = () => {
              debugLog(`Video playback started. Component ID: ${componentId}`);
            };
            
            videoRef.current.onerror = (e) => {
              debugLog(`Video error: ${e}. Component ID: ${componentId}`, e);
            };
          } else {
            debugLog(`videoRef.current is null! Component ID: ${componentId}`);
          }
        } else {
          // If component unmounted during getUserMedia call, clean up the stream
          debugLog(`Component unmounted during getUserMedia call. Cleaning up. Component ID: ${componentId}`);
          mediaStream.getTracks().forEach(track => {
            debugLog(`Stopping track: ${track.kind}/${track.label}. Component ID: ${componentId}`);
            track.stop();
          });
        }
      } catch (err) {
        debugLog(`Error accessing camera: ${err}. Component ID: ${componentId}`, err);
        console.error("Error accessing camera:", err);
        if (mounted) {
          setError(
            "Camera access denied. Please grant camera permissions by clicking the camera icon in your browser&apos;s address bar and refreshing the page."
          );
        }
      }
    };

    debugLog(`Calling startCamera(). Component ID: ${componentId}`);
    startCamera();

    // Cleanup function to stop the camera when component unmounts
    return () => {
      debugLog(`Effect cleanup running. Component ID: ${componentId}`);
      mounted = false;
      
      // Stop all tracks in the stream
      if (currentStream) {
        debugLog(`Stopping currentStream tracks. Component ID: ${componentId}`);
        currentStream.getTracks().forEach(track => {
          debugLog(`Stopping track from currentStream: ${track.kind}/${track.label}. Component ID: ${componentId}`);
          track.stop();
        });
      }
      
      if (stream) {
        debugLog(`Stopping stream tracks. Component ID: ${componentId}`);
        stream.getTracks().forEach(track => {
          debugLog(`Stopping track from stream: ${track.kind}/${track.label}. Component ID: ${componentId}`);
          track.stop();
        });
      }
      
      // Also clear the video source
      if (currentVideoRef && currentVideoRef.srcObject) {
        debugLog(`Clearing video srcObject. Component ID: ${componentId}`);
        currentVideoRef.srcObject = null;
      }
      
      debugLog(`Cleanup complete. Component ID: ${componentId}`);
    };
  }, [componentId]); // Only depend on componentId

  const captureImage = () => {
    debugLog(`Capture image called. Component ID: ${componentId}`);
    
    if (!videoRef.current) {
      debugLog(`videoRef.current is null during capture! Component ID: ${componentId}`);
      return;
    }
    
    if (!canvasRef.current) {
      debugLog(`canvasRef.current is null during capture! Component ID: ${componentId}`);
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    debugLog(`Video dimensions: ${video.videoWidth}x${video.videoHeight}. Component ID: ${componentId}`);
    
    // First capture the full image
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the full video frame to the canvas
    const context = canvas.getContext("2d");
    if (context) {
      debugLog(`Drawing full video to canvas. Component ID: ${componentId}`);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Now crop the image to the bounding box dimensions
      // The bounding box is 90% width and 80% height, centered in the video
      const boundingBoxWidth = video.videoWidth * 0.9;
      const boundingBoxHeight = video.videoHeight * 0.8;
      const boundingBoxX = (video.videoWidth - boundingBoxWidth) / 2;
      const boundingBoxY = (video.videoHeight - boundingBoxHeight) / 2;
      
      debugLog(`Bounding box: x=${boundingBoxX}, y=${boundingBoxY}, width=${boundingBoxWidth}, height=${boundingBoxHeight}`);
      
      // Get the image data from the bounding box area
      const imageData = context.getImageData(boundingBoxX, boundingBoxY, boundingBoxWidth, boundingBoxHeight);
      
      // Resize the canvas to the bounding box dimensions
      canvas.width = boundingBoxWidth;
      canvas.height = boundingBoxHeight;
      
      // Put the cropped image data back on the canvas
      context.putImageData(imageData, 0, 0);
      
      // Convert canvas to data URL
      debugLog(`Converting canvas to data URL. Component ID: ${componentId}`);
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9); // Higher quality JPEG
      
      // Call the onCapture callback with the image data
      debugLog(`Calling onCapture callback. Component ID: ${componentId}`);
      onCapture(imageDataUrl);
      
      // Store the image data in localStorage for the preview page
      debugLog(`Storing image in localStorage. Component ID: ${componentId}`);
      localStorage.setItem("capturedImage", imageDataUrl);
      
      // Navigate to the preview page
      debugLog(`Navigating to preview page. Component ID: ${componentId}`);
      router.push("/snap/preview");
    } else {
      debugLog(`Failed to get canvas context! Component ID: ${componentId}`);
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
              <li>Look for the camera icon in your browser&apos;s address bar</li>
              <li>Click it and select &quot;Allow&quot; for camera access</li>
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
        onLoadedMetadata={() => {
          debugLog(`Video metadata loaded. Component ID: ${componentId}`);
          // Explicitly play the video when metadata is loaded
          if (videoRef.current) {
            videoRef.current.play().catch(e => {
              debugLog(`Error playing video: ${e}. Component ID: ${componentId}`);
            });
          }
        }}
      />
      
      {/* Canvas for capturing the image (hidden) */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Form outline overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[90%] h-[80%] border-2 border-white border-dashed opacity-70 rounded-md relative">
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
