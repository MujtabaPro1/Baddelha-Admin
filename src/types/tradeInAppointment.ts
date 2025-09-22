export interface TradeInVehicle {
  make: string;
  model: string;
  year: string | number;
  makeId?: string;
  modelId?: string;
  mileage: string | number;
  condition?: string;
  estimatedValue?: number;
}

export interface TradeInAppointment {
  id: string;
  uid?: string;
  customerId?: string;
  customerName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'Scheduled';
  branchId?: string;
  carDetail?: string;
  carDetails?: {
    make: string;
    model: string;
    year: number;
    dealership?: string;
    sellingPrice?: string | number;
    dealershipCarId?: string;
    tradeInVehicle?: TradeInVehicle;
  };
  tradeInVehicle?: TradeInVehicle;
  car?: {
    make: string;
    model: string;
    year: number;
    carPrice?: number;
  };
  Branch?: {
    id: string;
    enName: string;
    arName: string;
  };
  dealership?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    image: string;
    logo?: {
      id: string;
      url: string;
      caption: string;
      fileType: string;
    };
    address: string;
    location: string;
    website: string;
    rating: number;
    reviews: number;
    services: string[];
    specialties: string[];
    tradeInBonus?: number;
    processingTime?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TradeInAppointmentResponse {
  data: TradeInAppointment[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
