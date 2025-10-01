import { format, subHours, subDays } from 'date-fns';

export interface MockNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type?: string;
  userId?: string;
  subject?: string;
  priority?: 'low' | 'normal' | 'high';
}

export const mockNotifications: MockNotification[] = [
  {
    id: '1',
    title: 'New Appointment Request',
    message: 'A new appointment has been scheduled for tomorrow at 2:00 PM.',
    createdAt: format(subHours(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    isRead: false,
    type: 'appointment'
  },
  {
    id: '2',
    title: 'User Registration',
    message: 'A new user has registered on the platform.',
    createdAt: format(subHours(new Date(), 5), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    isRead: true,
    type: 'user'
  },
  {
    id: '3',
    title: 'System Update',
    message: 'The system will undergo maintenance tonight from 2:00 AM to 4:00 AM.',
    createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    isRead: false
  },
  {
    id: '4',
    title: 'Inspection Completed',
    message: 'Vehicle inspection for appointment #12345 has been completed.',
    createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    isRead: true,
    type: 'appointment'
  }
];

// Mock users for the dropdown
export interface MockUser {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: string;
}

export const mockUsers: MockUser[] = [
  {
    id: '1',
    firstName: 'Ahmed',
    lastName: 'Al-Saud',
    email: 'ahmed@example.com',
    role: 'admin'
  },
  {
    id: '2',
    firstName: 'Fatima',
    lastName: 'Al-Qahtani',
    email: 'fatima@example.com',
    role: 'customer'
  },
  {
    id: '3',
    firstName: 'Mohammed',
    lastName: 'Al-Harbi',
    email: 'mohammed@example.com',
    role: 'inspector'
  },
  {
    id: '4',
    firstName: 'Sara',
    lastName: 'Al-Otaibi',
    email: 'sara@example.com',
    role: 'customer'
  }
];
