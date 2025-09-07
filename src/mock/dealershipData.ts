export interface TradeInDealership {
  id: string;
  name: string;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  totalCars: number;
  activeListings: number;
  soldCars: number;
  pendingCars: number;
  dateCreated: string;
  rating: number;
  monthlyPerformance: {
    month: string;
    sales: number;
    listings: number;
  }[];
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: string;
  exactModel?: string; // Added exactModel field
  price: number;
  status: 'available' | 'pending' | 'sold';
  imageUrl: string;
  dealershipId: string;
  listedDate: string;
}

export const mockDealerships: TradeInDealership[] = [
  {
    id: '1',
    name: 'Premium Auto Exchange',
    location: 'Riyadh, King Fahd Road',
    contactPerson: 'Ahmed Al-Saud',
    phone: '+966 50 123 4567',
    email: 'contact@premiumauto.sa',
    totalCars: 45,
    activeListings: 28,
    soldCars: 12,
    pendingCars: 5,
    dateCreated: '2023-06-15',
    rating: 4.8,
    monthlyPerformance: [
      { month: 'Jan', sales: 8, listings: 12 },
      { month: 'Feb', sales: 10, listings: 15 },
      { month: 'Mar', sales: 7, listings: 9 },
      { month: 'Apr', sales: 12, listings: 18 },
      { month: 'May', sales: 15, listings: 22 },
      { month: 'Jun', sales: 11, listings: 16 }
    ]
  },
  {
    id: '2',
    name: 'Al-Jazira Motors',
    location: 'Jeddah, Palestine Street',
    contactPerson: 'Khalid Al-Harbi',
    phone: '+966 55 987 6543',
    email: 'info@aljazira-motors.com',
    totalCars: 32,
    activeListings: 19,
    soldCars: 8,
    pendingCars: 5,
    dateCreated: '2023-08-22',
    rating: 4.5,
    monthlyPerformance: [
      { month: 'Jan', sales: 5, listings: 8 },
      { month: 'Feb', sales: 7, listings: 10 },
      { month: 'Mar', sales: 9, listings: 12 },
      { month: 'Apr', sales: 6, listings: 9 },
      { month: 'May', sales: 8, listings: 11 },
      { month: 'Jun', sales: 10, listings: 14 }
    ]
  },
  {
    id: '3',
    name: 'Eastern Auto Traders',
    location: 'Dammam, Corniche Road',
    contactPerson: 'Faisal Al-Otaibi',
    phone: '+966 54 567 8901',
    email: 'sales@easterntraders.sa',
    totalCars: 58,
    activeListings: 32,
    soldCars: 20,
    pendingCars: 6,
    dateCreated: '2022-11-10',
    rating: 4.7,
    monthlyPerformance: [
      { month: 'Jan', sales: 12, listings: 18 },
      { month: 'Feb', sales: 15, listings: 22 },
      { month: 'Mar', sales: 13, listings: 19 },
      { month: 'Apr', sales: 18, listings: 25 },
      { month: 'May', sales: 16, listings: 23 },
      { month: 'Jun', sales: 14, listings: 20 }
    ]
  },
  {
    id: '4',
    name: 'Royal Car Market',
    location: 'Riyadh, Olaya Street',
    contactPerson: 'Majid Al-Qahtani',
    phone: '+966 56 234 5678',
    email: 'info@royalcarmarket.com',
    totalCars: 27,
    activeListings: 15,
    soldCars: 9,
    pendingCars: 3,
    dateCreated: '2023-10-05',
    rating: 4.3,
    monthlyPerformance: [
      { month: 'Jan', sales: 6, listings: 9 },
      { month: 'Feb', sales: 8, listings: 12 },
      { month: 'Mar', sales: 5, listings: 8 },
      { month: 'Apr', sales: 7, listings: 10 },
      { month: 'May', sales: 9, listings: 13 },
      { month: 'Jun', sales: 7, listings: 11 }
    ]
  },
  {
    id: '5',
    name: 'Al-Madinah Auto Gallery',
    location: 'Madinah, Airport Road',
    contactPerson: 'Saad Al-Shamrani',
    phone: '+966 58 345 6789',
    email: 'contact@madinahgallery.sa',
    totalCars: 39,
    activeListings: 22,
    soldCars: 14,
    pendingCars: 3,
    dateCreated: '2023-04-18',
    rating: 4.6,
    monthlyPerformance: [
      { month: 'Jan', sales: 9, listings: 14 },
      { month: 'Feb', sales: 11, listings: 16 },
      { month: 'Mar', sales: 8, listings: 12 },
      { month: 'Apr', sales: 13, listings: 19 },
      { month: 'May', sales: 10, listings: 15 },
      { month: 'Jun', sales: 12, listings: 17 }
    ]
  }
];

export const mockCars: Car[] = [
  {
    id: '101',
    make: 'Toyota',
    model: 'Camry',
    year: '2022',
    price: 85000,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3',
    dealershipId: '1',
    listedDate: '2023-12-10'
  },
  {
    id: '102',
    make: 'Honda',
    model: 'Accord',
    year: '2021',
    price: 78000,
    status: 'sold',
    imageUrl: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?ixlib=rb-4.0.3',
    dealershipId: '1',
    listedDate: '2023-11-15'
  },
  {
    id: '103',
    make: 'Nissan',
    model: 'Altima',
    year: '2023',
    price: 92000,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?ixlib=rb-4.0.3',
    dealershipId: '1',
    listedDate: '2024-01-05'
  },
  {
    id: '104',
    make: 'Hyundai',
    model: 'Sonata',
    year: '2022',
    price: 75000,
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3',
    dealershipId: '2',
    listedDate: '2023-12-20'
  },
  {
    id: '105',
    make: 'Kia',
    model: 'K5',
    year: '2023',
    price: 82000,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3',
    dealershipId: '2',
    listedDate: '2024-02-01'
  },
  {
    id: '106',
    make: 'Ford',
    model: 'Fusion',
    year: '2021',
    price: 68000,
    status: 'sold',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3',
    dealershipId: '3',
    listedDate: '2023-10-12'
  },
  {
    id: '107',
    make: 'Chevrolet',
    model: 'Malibu',
    year: '2022',
    price: 72000,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-4.0.3',
    dealershipId: '3',
    listedDate: '2023-11-25'
  },
  {
    id: '108',
    make: 'Mazda',
    model: 'Mazda6',
    year: '2023',
    price: 88000,
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3',
    dealershipId: '3',
    listedDate: '2024-01-15'
  },
  {
    id: '109',
    make: 'Volkswagen',
    model: 'Passat',
    year: '2021',
    price: 76000,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?ixlib=rb-4.0.3',
    dealershipId: '4',
    listedDate: '2023-12-05'
  },
  {
    id: '110',
    make: 'BMW',
    model: '3 Series',
    year: '2022',
    price: 120000,
    status: 'sold',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3',
    dealershipId: '5',
    listedDate: '2023-09-20'
  },
  {
    id: '111',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    year: '2023',
    price: 135000,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3',
    dealershipId: '5',
    listedDate: '2024-02-10'
  },
  {
    id: '112',
    make: 'Audi',
    model: 'A4',
    year: '2022',
    price: 125000,
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?ixlib=rb-4.0.3',
    dealershipId: '5',
    listedDate: '2024-01-25'
  }
];
