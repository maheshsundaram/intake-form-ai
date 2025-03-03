"use client";

import { useState, useEffect } from "react";
import { useFormStore } from "@/store/formStore";

export function usePolling(enabled: boolean = false) {
  const [isPolling, setIsPolling] = useState(false);
  const [hasReceived, setHasReceived] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const { receiveMobileSubmission, setWaitingForPhoto, setProcessing } = useFormStore();

  useEffect(() => {
    if (!enabled) {
      setIsPolling(false);
      return;
    }

    // Don't start polling if we've already received data
    if (hasReceived && !submissionId) {
      console.log("Already received data and no submission ID, not starting polling");
      return;
    }

    setIsPolling(true);
    setWaitingForPhoto(true);

    // Check for a stored submission ID in localStorage
    const storedSubmissionId = localStorage.getItem("lastSubmissionId");
    // Also check if we have a pending form ID that matches what we're looking for
    const pendingFormId = localStorage.getItem("pendingFormId");
    
    if (storedSubmissionId && !submissionId) {
      console.log("Found stored submission ID:", storedSubmissionId);
      setSubmissionId(storedSubmissionId);
    } else if (pendingFormId) {
      console.log("Found pending form ID:", pendingFormId);
      // We'll poll for submissions that target this form ID
    }

    console.log("Starting polling interval");
    // Start polling
    const intervalId = setInterval(async () => {
      try {
        // Continue polling even after initial receipt to get updates
        try {
          // Always check for submissions, even if we've already received one
          // This allows us to get updates as processing completes
          
          // If we have a specific submission ID, check its status
          // If we have a pending form ID, check for submissions targeting that form
          const pendingFormId = localStorage.getItem("pendingFormId");
          
          let url = '/api/submissions';
          if (submissionId) {
            url = `/api/submissions?id=${submissionId}`;
          } else if (pendingFormId) {
            url = `/api/submissions?targetFormId=${pendingFormId}`;
          }
          
          console.log("Polling URL:", url);
          
          // Fetch the submission
          const response = await fetch(url, {
            method: 'DELETE', // Using DELETE to get and potentially remove the submission
          });
            
          if (response.ok) {
            const result = await response.json();
            
            if (result.success && result.submission) {
              const submission = result.submission;
              
              // If we don't have a submission ID yet, store it
              if (!submissionId && submission.id) {
                setSubmissionId(submission.id);
              }
              
              // Handle different submission states
              if (submission.status === 'pending') {
                // Just received the image, show it but keep processing state
                console.log("Received pending submission:", submission.id);
                setProcessing(true, 'analyzing');
                
                // Update the form with the image but keep processing
                receiveMobileSubmission({
                  capturedImage: submission.capturedImage
                }, true); // true = keep processing state
                
                // Mark as received but keep polling for OCR results
                setHasReceived(true);
              }
              else if (submission.status === 'processing') {
                // OCR is in progress
                console.log("Submission is processing:", submission.id);
                setProcessing(true, 'extracting');
                
                // If we haven't received the image yet, show it
                if (!hasReceived && submission.capturedImage) {
                  receiveMobileSubmission({
                    capturedImage: submission.capturedImage
                  }, true); // true = keep processing state
                  
                  setHasReceived(true);
                }
              }
              else if (submission.status === 'completed') {
                // OCR is complete, update the form with all data
                console.log("Received completed submission:", submission.id);
                
                // Process the submission with all extracted data
                receiveMobileSubmission(submission, false); // false = clear processing state
                
                // Update state and clear everything
                setHasReceived(true);
                setIsPolling(false);
                setWaitingForPhoto(false);
                setSubmissionId(null);
                
                // Clear the submission ID from localStorage
                localStorage.removeItem("lastSubmissionId");
                
                // Clear the interval to stop polling
                clearInterval(intervalId);
                console.log("Polling stopped - submission complete");
              }
              else if (submission.status === 'error') {
                // OCR failed, but we can still show the image
                console.error("Submission processing error:", submission.error);
                
                // If we have an image, show it but mark processing as complete
                if (submission.capturedImage) {
                  receiveMobileSubmission({
                    capturedImage: submission.capturedImage
                  }, false); // false = clear processing state
                }
                
                // Update state and clear everything
                setHasReceived(true);
                setIsPolling(false);
                setWaitingForPhoto(false);
                setSubmissionId(null);
                
                // Clear the submission ID from localStorage
                localStorage.removeItem("lastSubmissionId");
                
                // Clear the interval to stop polling
                clearInterval(intervalId);
                console.log("Polling stopped - submission error");
              }
            }
          }
        } catch (error) {
          console.error("Error fetching submissions:", error);
        }
      } catch (error) {
        console.error("Error polling for mobile submission:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      console.log("Cleaning up polling interval");
      clearInterval(intervalId);
      setWaitingForPhoto(false);
    };
  }, [enabled, hasReceived, submissionId, receiveMobileSubmission, setWaitingForPhoto, setProcessing]);

  return {
    isPolling,
    hasReceived,
    resetPolling: () => {
      console.log("Resetting polling state");
      setHasReceived(false);
      setSubmissionId(null);
      setIsPolling(false);
      setWaitingForPhoto(false);
    }
  };
}
