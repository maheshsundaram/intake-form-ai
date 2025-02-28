"use client";

import { useState, useEffect } from "react";
import { useFormStore } from "@/store/formStore";

export function usePolling(enabled: boolean = false) {
  const [isPolling, setIsPolling] = useState(false);
  const [hasReceived, setHasReceived] = useState(false);
  const { receiveMobileSubmission, setWaitingForPhoto } = useFormStore();

  useEffect(() => {
    if (!enabled) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    setWaitingForPhoto(true);

    // Start polling
    const intervalId = setInterval(async () => {
      try {
        // Check API for pending submissions
        if (!hasReceived) {
          try {
            // Fetch the oldest pending submission
            const response = await fetch('/api/submissions', {
              method: 'DELETE', // Using DELETE to get and remove the oldest submission
            });
            
            if (response.ok) {
              const result = await response.json();
              
              if (result.success && result.submission) {
                // Process the submission
                receiveMobileSubmission(result.submission);
                
                // Update state
                setHasReceived(true);
                setIsPolling(false);
                setWaitingForPhoto(false);
              }
            }
          } catch (error) {
            console.error("Error fetching submissions:", error);
          }
        }
      } catch (error) {
        console.error("Error polling for mobile submission:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      clearInterval(intervalId);
      setWaitingForPhoto(false);
    };
  }, [enabled, hasReceived, receiveMobileSubmission, setWaitingForPhoto]);

  return {
    isPolling,
    hasReceived,
    resetPolling: () => setHasReceived(false)
  };
}
