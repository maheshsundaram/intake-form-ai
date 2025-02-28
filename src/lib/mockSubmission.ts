// Mock data for simulating a form submission from the mobile app
export const mockFormData = {
  customerName: "Sivakumar Murugan",
  email: "sivakumar.m@gmail.com",
  cellPhone: "(808) 555-2143",
  address: "2831 Kapiolani Blvd, Apt 204, Honolulu, HI 96826",
  homePhone: "(808) 555-8976",
  vehicleYear: "2022",
  vehicleMake: "Toyota",
  vehicleModel: "RAV4",
  vehicleColor: "Silver",
  licensePlate: "KDV 421",
  mileage: "18,432",
  warranty: "yes" as const,
  warrantyProvider: "Toyota Care Plus",
  knownIssues: "Occasional rattling sound from dashboard when driving on rough roads",
  serviceRequests: [
    {
      area: "AC/Heating",
      description: "AC not cooling properly during afternoon drives"
    },
    {
      area: "Maintenance",
      description: "Due for routine oil change and tire rotation"
    }
  ],
  signature: "Sivakumar Murugan",
  signatureDate: new Date().toISOString().split('T')[0],
  capturedImage: "" // Add empty string for capturedImage property
};

// Function to simulate sending form data from mobile to desktop
export const submitMockData = () => {
  // In a real app, this would send data to a server
  // For the MVP, we'll just return the mock data
  return Promise.resolve(mockFormData);
};
