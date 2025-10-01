import { Lead } from '../types/lead';
import { format, subDays } from 'date-fns';

// Generate mock leads data
export const mockLeads: Lead[] = [
  {
    id: '1',
    fullName: 'Ahmed Al-Saud',
    email: 'ahmed@example.com',
    phone: '+966 50 123 4567',
    subject: 'General Inquiry',
    message: 'I would like to know more about your services and how they work. Can someone contact me with more information?',
    createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    status: 'new'
  },
  {
    id: '2',
    fullName: 'Fatima Al-Qahtani',
    email: 'fatima@example.com',
    phone: '+966 55 987 6543',
    subject: 'Car Valuation',
    message: 'I have a 2019 Toyota Camry that I would like to get valued. What information do you need from me to provide an estimate?',
    createdAt: format(subDays(new Date(), 3), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    status:'new',
    notes: 'Called customer on 2025-09-30, waiting for vehicle details'
  },
  {
    id: '3',
    fullName: 'Mohammed Al-Harbi',
    email: 'mohammed@example.com',
    phone: '+966 54 111 2222',
    subject: 'Technical Support',
    message: 'I\'m having trouble with the mobile app. It keeps crashing when I try to upload photos of my car. Can you help?',
    createdAt: format(subDays(new Date(), 5), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    status: 'resolved',
    notes: 'Issue was resolved. User was using an outdated version of the app.'
  },
  {
    id: '4',
    fullName: 'Sara Al-Otaibi',
    email: 'sara@example.com',
    phone: '+966 56 333 4444',
    subject: 'Partnership Opportunity',
    message: 'I represent a car dealership in Jeddah and we\'re interested in partnering with Baddelha. Who should I speak with about this opportunity?',
    createdAt: format(subDays(new Date(), 7), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    status: 'new',
    notes: 'Forwarded to business development team'
  },
  {
    id: '5',
    fullName: 'Khalid Al-Dossary',
    email: 'khalid@example.com',
    phone: '+966 59 555 6666',
    subject: 'Complaint',
    message: 'I had an inspection scheduled for yesterday but no one showed up. I waited for 2 hours and tried calling but couldn\'t reach anyone. This is very disappointing.',
    createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    status: 'new'
  },
  {
    id: '6',
    fullName: 'Nora Al-Shammari',
    email: 'nora@example.com',
    phone: '+966 58 777 8888',
    subject: 'Select a subject',
    message: 'I saw your advertisement on social media and I\'m interested in selling my car. How does the process work and what are your fees?',
    createdAt: format(subDays(new Date(), 10), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    status: 'resolved',
    notes: 'Provided information about the selling process and directed to app download'
  },
  {
    id: '7',
    fullName: 'Abdullah Al-Ghamdi',
    email: 'abdullah@example.com',
    phone: '+966 53 999 0000',
    subject: 'Job Application',
    message: 'I\'m an experienced car inspector with 5 years of experience. I\'m interested in joining your team. How can I apply for a position?',
    createdAt: format(subDays(new Date(), 15), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    status: 'new',
    notes: 'Not hiring inspectors at the moment. Added to talent pool for future opportunities.'
  }
];
