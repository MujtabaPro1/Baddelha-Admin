export interface TradeInAppointment {
  id: string;
  uid: string;
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  branchId: string;
  carDetail: string;
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
