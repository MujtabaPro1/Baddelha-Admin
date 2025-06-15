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

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}