import axiosInstance from './api';

// Types for API responses
export interface ApiAppointment {
  id: number;
  userId: number;
  userName: string;
  date: string;
  time: string;
  purpose: string;
  status: string;
  createdAt?: string; // Added for activity tracking
}

export interface ApiCar {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  status: string;
  createdAt?: string; // Added for activity tracking
}

export interface ApiAuctionCar {
  id: number;
  make: string;
  model: string;
  year: number;
  currentBid: number;
  status: string;
  endsAt: string;
  createdAt?: string; // Added for activity tracking
}

export interface ApiInspection {
  id: number;
  carId: number;
  inspectorId: number;
  inspectorName: string;
  date: string;
  status: string;
  createdAt?: string; // Added for activity tracking
  carDetails?: {
    make: string;
    model: string;
    year: number;
  };
}

// Dashboard data service
export const dashboardService = {
  // Get appointments
  getAppointments: async () => {
    try {
      const response = await axiosInstance.get('/1.0/book-appointment');
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Get cars
  getCars: async () => {
    try {
      const response = await axiosInstance.get('/1.0/car/find-all');
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching cars:', error);
      throw error;
    }
  },

  // Get auction cars
  getAuctionCars: async () => {
    try {
      const response = await axiosInstance.get('/1.0/auction?status=LIVE');
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching auction cars:', error);
      throw error;
    }
  },

  // Get inspections
  getInspections: async () => {
    try {
      const response = await axiosInstance.get('/1.0/inspection/find-all');
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching inspections:', error);
      throw error;
    }
  },

  // Get dashboard data (combines all requests)
  getDashboardData: async () => {
    try {
      const [appointments, cars, auctionCars, inspections] = await Promise.all([
        dashboardService.getAppointments(),
        dashboardService.getCars(),
        dashboardService.getAuctionCars(),
        dashboardService.getInspections()
      ]);

      return {
        appointments,
        cars,
        auctionCars,
        inspections
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

export default dashboardService;
