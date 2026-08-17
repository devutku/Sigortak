export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  ownerId: string;
  ownerName?: string;
  ownerTcNo?: string;
  ownerAddress?: string;
  usageType?: string;
  trafficRegistrationDate?: string;
  bodyType: string;
  engineNumber?: string;
  engineCapacity?: string;
  chassisNumber?: string;
  registrationNumber?: string;
  inspectionDate?: string;
  inspectionPassed?: boolean;
  inspectionDocumentUrl?: string;
  insuranceEndDate?: string;
  inspectionRemainingDays?: number;
  inspectionStatus?: string;
  insuranceRemainingDays?: number;
  insuranceStatus?: string;
  policyId?: string;
  policyNumber?: string;
  sbmPolicyNumber?: string;
  policyStartDate?: string;
  policyEndDate?: string;
  policyPremium?: number;
  policyDocumentUrl?: string;
}

export interface Quote {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleInfo: string;
  insuranceCompany: string;
  agentName: string;
  policyType: number;
  premium: number;
  validityDate: string;
  status: number;
  immLimit: string;
  replacementCar: string;
  deductible: string;
  glassCoverage: boolean;
  assistance: boolean;
  documentUrl?: string;
}
