import axiosInstance from './api';

// Types for API responses
export interface ApiAppointment {
  uid: string;
  id: number;
  userId: number;
  userName: string;
  date: string;
  appointmentDate: string;
  appointmentTime: string;
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
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  getAppointmentsCount: async () => {
    try {
      const response = await axiosInstance.post('/1.0/book-appointment/search',{
        page: 1,
        limit: 100
      });
      return response.data?.meta?.total;
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

  getCarsCount: async () => {
    try {
      const response = await axiosInstance.get('/1.0/car/find-all');
      return response.data?.totalCount;
    } catch (error) {
      console.error('Error fetching cars count:', error);
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

  getInspectionsCount: async () => {
    try {
      const response = await axiosInstance.get('/1.0/inspection/find-all');
      return response.data?.totalCount;
    } catch (error) {
      console.error('Error fetching inspections:', error);
      throw error;
    }
  },

  // Get dashboard data (combines all requests — each failure returns null, never blocks others)
  getDashboardData: async () => {
    const [appointmentsResult, appointmentsCountResult, carsResult, carsCountResult, auctionCarsResult, inspectionsResult, inspectionsCountResult] =
      await Promise.allSettled([
        dashboardService.getAppointments(),
        dashboardService.getAppointmentsCount(),
        dashboardService.getCars(),
        dashboardService.getCarsCount(),
        dashboardService.getAuctionCars(),
        dashboardService.getInspections(),
        dashboardService.getInspectionsCount(),
      ]);

    const resolve = <T>(result: PromiseSettledResult<T>, fallback: T): T =>
      result.status === 'fulfilled' ? result.value ?? fallback : fallback;

    return {
      appointments: resolve(appointmentsResult, []),
      appointmentsCount: resolve(appointmentsCountResult, 0),
      cars:         resolve(carsResult, []),
      carsCount:    resolve(carsCountResult, 0),
      auctionCars:  resolve(auctionCarsResult, []),
      inspections:  resolve(inspectionsResult, []),
      inspectionsCount: resolve(inspectionsCountResult, 0),
    };
  },
};

export default dashboardService;
