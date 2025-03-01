import { NextResponse } from 'next/server';
import OpenAI from "openai";

// Define a type for submissions
interface Submission {
  id: string;
  timestamp: string;
  capturedImage?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  targetFormId?: string | null;
  customerName?: string;
  email?: string;
  cellPhone?: string;
  address?: string;
  homePhone?: string;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  licensePlate?: string;
  mileage?: string;
  warranty?: string;
  warrantyProvider?: string;
  knownIssues?: string;
  signature?: string;
  signatureDate?: string;
  serviceRequests?: Array<{
    area?: string;
    description?: string;
  }>;
  [key: string]: unknown;
}

// In-memory storage for submissions (in a real app, this would be a database)
const pendingSubmissions: Submission[] = [];

// Initialize the OpenAI client for server-side use
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use server environment variable (not NEXT_PUBLIC_)
});

// Server-side retry logic
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      // Exponential backoff
      delay *= 2;
    }
  }
  
  throw lastError;
}

// Server-side image processing with OpenAI
async function processImageWithAI(imageBase64: string): Promise<{
  success: boolean;
  data?: Partial<Submission>;
  error?: string;
}> {
  try {
    // Remove the data URL prefix if present
    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    
    // Define the system prompt for form extraction
    const systemPrompt = `
      You are an AI assistant specialized in extracting information from automotive service forms.
      Extract the following fields from the image:
      - Customer Name
      - Email
      - Cell Phone
      - Address
      - Home Phone
      - Vehicle Year
      - Vehicle Make
      - Vehicle Model
      - Vehicle Color
      - License Plate
      - Mileage
      - Warranty (yes/no)
      - Warranty Provider
      - Known Issues
      - Service Requests (area and description)
      - Signature
      - Date

      Format your response as a JSON object with these fields. If a field is not visible or unclear, leave it as an empty string.
      For service requests, create an array of objects with 'area' and 'description' properties.
    `;

    console.log("Sending image to OpenAI for processing...");
    
    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            },
            {
              type: "text",
              text: "Extract all the information from this automotive service form."
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    // Parse the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }
    console.log("content", content)

    // Extract JSON from the response
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                    content.match(/```\n([\s\S]*?)\n```/) ||
                    content.match(/{[\s\S]*?}/);
                    
    let jsonStr = jsonMatch ? jsonMatch[0] : content;

    console.log("jsonStr", jsonStr);
    
    // Clean up the JSON string if it contains markdown code blocks
    jsonStr = jsonStr.replace(/```json\n|```\n|```/g, '');

    console.log("cleaned jsonStr", jsonStr)
    
    // Parse the JSON
    const formData = JSON.parse(jsonStr);

    console.log("formData", formData);
    
    // Transform the data to match our Submission structure
    // Format the date as ISO string if it exists
    let formattedDate = "";
    if (formData['Date']) {
      try {
        // Try to parse the date from various formats
        const dateStr = formData['Date'];
        
        // First try to parse as MM/DD/YYYY
        const parts = dateStr.split(/[\/\-\.]/);
        let parsedDate;
        
        if (parts.length === 3) {
          // Check if it's in MM/DD/YYYY format
          if (parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
            // Create date with local timezone (no time part)
            const month = parseInt(parts[0], 10) - 1; // JS months are 0-indexed
            const day = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            
            // Create date at noon to avoid timezone issues
            parsedDate = new Date(year, month, day, 12, 0, 0);
          }
        }
        
        // If the above parsing failed, try the standard Date constructor
        if (!parsedDate || isNaN(parsedDate.getTime())) {
          parsedDate = new Date(dateStr);
        }
        
        if (!isNaN(parsedDate.getTime())) {
          // Format as ISO string but preserve the date part exactly as entered
          const year = parsedDate.getFullYear();
          const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const day = String(parsedDate.getDate()).padStart(2, '0');
          
          // Create ISO string with time set to noon UTC to avoid timezone issues
          formattedDate = `${year}-${month}-${day}T12:00:00.000Z`;
        } else {
          formattedDate = dateStr;
        }
      } catch (e) {
        console.error("Error parsing date:", e);
        formattedDate = formData['Date'];
      }
    }

    const transformedData: Partial<Submission> = {
      customerName: formData['Customer Name'] || "",
      email: formData['Email'] || "",
      cellPhone: formData['Cell Phone'] || "",
      address: formData['Address'] || "",
      homePhone: formData['Home Phone'] || "",
      vehicleYear: formData['Vehicle Year'] || "",
      vehicleMake: formData['Vehicle Make'] || "",
      vehicleModel: formData['Vehicle Model'] || "",
      vehicleColor: formData['Vehicle Color'] || "",
      licensePlate: formData['License Plate'] || "",
      mileage: formData['Mileage'] || "",
      warranty: formData['Warranty']?.toLowerCase() || "",
      warrantyProvider: formData['Warranty Provider'] || "",
      knownIssues: formData['Known Issues'] || "",
      signature: formData['Signature'] || "",
      signatureDate: formattedDate,
      serviceRequests: formData['Service Requests'] || [{}]
    };

    return {
      success: true,
      data: transformedData
    };
  } catch (error) {
    console.error("Error processing image with OpenAI:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

// Process image with OpenAI in the background
async function processSubmissionInBackground(submission: Submission) {
  try {
    console.log(`Starting background processing for submission ${submission.id}`);
    
    // Update status to processing
    submission.status = 'processing';
    
    // Process the image with OpenAI
    if (submission.capturedImage) {
      const result = await withRetry(() => processImageWithAI(submission.capturedImage as string));
      
      if (result.success && result.data) {
        // Update the submission with the extracted data
        Object.assign(submission, result.data);
        console.log("data", result.data)
        submission.status = 'completed';
        console.log(`Completed processing for submission ${submission.id}`);
      } else {
        submission.status = 'error';
        submission.error = result.error || 'Unknown error during OCR processing';
        console.error(`Error processing submission ${submission.id}:`, submission.error);
      }
    } else {
      submission.status = 'error';
      submission.error = 'No image data provided';
      console.error(`Error processing submission ${submission.id}: No image data`);
    }
  } catch (error) {
    submission.status = 'error';
    submission.error = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in background processing for submission ${submission.id}:`, error);
  }
}

export async function GET() {
  // Return all pending submissions
  return NextResponse.json({ submissions: pendingSubmissions });
}

export async function POST(request: Request) {
  try {
    // Get the submission data from the request body
    const data = await request.json();
    
    if (!data.capturedImage) {
      return NextResponse.json(
        { success: false, message: 'No image data provided' },
        { status: 400 }
      );
    }
    
    // Use the target form ID if provided, otherwise generate a new one
    const submissionId = data.targetFormId || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create a new submission with the ID
    const submission: Submission = {
      id: submissionId,
      timestamp: new Date().toISOString(),
      capturedImage: data.capturedImage,
      status: 'pending',
      targetFormId: data.targetFormId || null
    };
    
    // Add the submission to the pending submissions
    pendingSubmissions.push(submission);
    
    // Start background processing
    processSubmissionInBackground(submission).catch(err => {
      console.error('Background processing error:', err);
    });
    
    // Return a success response immediately with the submission ID
    return NextResponse.json({ 
      success: true, 
      message: 'Submission received and processing started',
      submissionId: submission.id
    });
  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing submission' },
      { status: 500 }
    );
  }
}

// Helper function to get the oldest submission that's ready for consumption
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  // If an ID is provided, return that specific submission
  if (id) {
    const index = pendingSubmissions.findIndex(sub => sub.id === id);
    if (index >= 0) {
      const submission = pendingSubmissions[index];
      
      console.log(`Returning submission ${id} with status: ${submission.status}`);
      
      // Only remove completed submissions when explicitly requested with a removeCompleted param
      const removeCompleted = url.searchParams.get('removeCompleted') === 'true';
      if (removeCompleted && (submission.status === 'completed' || submission.status === 'error')) {
        console.log(`Removing completed submission ${id}`);
        pendingSubmissions.splice(index, 1);
      }
      
      return NextResponse.json({ success: true, submission });
    }
    
    return NextResponse.json(
      { success: false, message: 'Submission not found' },
      { status: 404 }
    );
  }
  
  // Check if we're looking for a submission for a specific form
  const targetFormId = url.searchParams.get('targetFormId');
  
  // If we have a target form ID, look for submissions targeting that form
  if (targetFormId) {
    const targetIndex = pendingSubmissions.findIndex(sub => 
      sub.targetFormId === targetFormId && 
      (sub.status === 'pending' || sub.status === 'processing' || sub.status === 'completed')
    );
    
    if (targetIndex >= 0) {
      return NextResponse.json({ 
        success: true, 
        submission: pendingSubmissions[targetIndex],
        status: pendingSubmissions[targetIndex].status
      });
    }
  }
  
  // If no target form ID or no matching submission, look for the oldest pending submission
  const pendingIndex = pendingSubmissions.findIndex(sub => 
    sub.status === 'pending' || sub.status === 'processing'
  );
  
  if (pendingIndex >= 0) {
    return NextResponse.json({ 
      success: true, 
      submission: pendingSubmissions[pendingIndex],
      status: 'processing'
    });
  }
  
  // If no pending submissions, look for completed ones
  const completedIndex = pendingSubmissions.findIndex(sub => 
    sub.status === 'completed' || sub.status === 'error'
  );
  
  if (completedIndex >= 0) {
    const submission = pendingSubmissions[completedIndex];
    
    // Only remove if explicitly requested
    const removeCompleted = url.searchParams.get('removeCompleted') === 'true';
    if (removeCompleted) {
      console.log(`Removing completed submission ${submission.id}`);
      pendingSubmissions.splice(completedIndex, 1);
    }
    
    return NextResponse.json({ success: true, submission });
  }
  
  // No submissions available
  return NextResponse.json(
    { success: true, message: 'No pending submissions' },
    { status: 200 }
  );
}
