export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer' | 'dealer';
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  condition: 'new' | 'used';
  mileage: number;
  fuelType: string;
  transmission: 'automatic' | 'manual';
  color: string;
  status: 'available' | 'sold' | 'pending';
  thumbnailUrl: string;
}

export interface Appointment {
  id: string;
  userId: string;
  carId: string;
  date: string;
  time: string;
  location: string;
  purpose: 'buy' | 'sell' | 'tradeIn';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface ValuationRequest {
  id: string;
  userId: string;
  carId: string;
  requestDate: string;
  bankName: string;
  status: 'pending' | 'approved' | 'rejected';
  amount?: number;
  notes?: string;
}

export interface InspectionRequest {
  id: string;
  userId: string;
  carId: string;
  requestDate: string;
  inspectionDate?: string;
  location: string;
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  inspectorId?: string;
  notes?: string;
}

export interface InspectionReport {
  id: string;
  inspectionId: string;
  inspectorId: string;
  completedDate: string;
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor';
  exteriorCondition: 'excellent' | 'good' | 'fair' | 'poor';
  interiorCondition: 'excellent' | 'good' | 'fair' | 'poor';
  engineCondition: 'excellent' | 'good' | 'fair' | 'poor';
  mileageVerified: boolean;
  actualMileage?: number;
  defects: string[];
  recommendations: string;
  estimatedValue: number;
  images: string[];
  signature?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'inspector';
}