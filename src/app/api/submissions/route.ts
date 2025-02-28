import { NextResponse } from 'next/server';

// Define a type for submissions
interface Submission {
  timestamp: string;
  capturedImage?: string;
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

export async function GET() {
  // Return all pending submissions
  return NextResponse.json({ submissions: pendingSubmissions });
}

export async function POST(request: Request) {
  try {
    // Get the submission data from the request body
    const data = await request.json();
    
    // Add a timestamp to the submission
    const submission = {
      ...data,
      timestamp: new Date().toISOString()
    };
    
    // Add the submission to the pending submissions
    pendingSubmissions.push(submission);
    
    // In a real app, we would store this in a database
    console.log('Received submission:', submission);
    
    // Return a success response
    return NextResponse.json({ success: true, message: 'Submission received' });
  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing submission' },
      { status: 500 }
    );
  }
}

// Helper function to get and remove the oldest submission
export async function DELETE() {
  if (pendingSubmissions.length === 0) {
    return NextResponse.json(
      { success: true, message: 'No pending submissions' },
      { status: 200 }
    );
  }
  
  // Get the oldest submission
  const submission = pendingSubmissions.shift();
  
  return NextResponse.json({ success: true, submission });
}
