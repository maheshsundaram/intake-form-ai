"use client";

import OpenAI from "openai";
import { FormData } from "@/store/formStore";

// Initialize the OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Enable client-side usage
});

// Define the structure for OCR processing results
export interface OCRResult {
  success: boolean;
  data?: Partial<FormData>;
  error?: string;
}

// Process image with OpenAI Vision API
export async function processImageWithAI(imageBase64: string): Promise<OCRResult> {
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

    // Extract JSON from the response
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                    content.match(/```\n([\s\S]*?)\n```/) ||
                    content.match(/{[\s\S]*?}/);
                    
    let jsonStr = jsonMatch ? jsonMatch[0] : content;
    
    // Clean up the JSON string if it contains markdown code blocks
    jsonStr = jsonStr.replace(/```json\n|```\n|```/g, '');
    
    // Parse the JSON
    const formData = JSON.parse(jsonStr);
    
    // Transform the data to match our FormData structure
    const transformedData: Partial<FormData> = {
      customerName: formData.customerName || "",
      email: formData.email || "",
      cellPhone: formData.cellPhone || "",
      address: formData.address || "",
      homePhone: formData.homePhone || "",
      vehicleYear: formData.vehicleYear || "",
      vehicleMake: formData.vehicleMake || "",
      vehicleModel: formData.vehicleModel || "",
      vehicleColor: formData.vehicleColor || "",
      licensePlate: formData.licensePlate || "",
      mileage: formData.mileage || "",
      warranty: formData.warranty || "",
      warrantyProvider: formData.warrantyProvider || "",
      knownIssues: formData.knownIssues || "",
      signature: formData.signature || "",
      signatureDate: formData.date || "",
      serviceRequests: formData.serviceRequests || [{}]
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

// Retry logic for API calls
export async function withRetry<T>(
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
