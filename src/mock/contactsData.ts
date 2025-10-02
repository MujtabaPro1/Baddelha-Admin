import { Contact } from '../types/contact';

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Ahmed Ali',
    email: 'ahmed.ali@example.com',
    phone: '+971 50 123 4567',
    subject: 'Car Inspection Query',
    message: 'I would like to know more about your car inspection services. Do you offer pre-purchase inspections?',
    status: 'new',
    createdAt: '2025-09-30T08:30:00Z',
    updatedAt: '2025-09-30T08:30:00Z'
  },
  {
    id: '2',
    name: 'Fatima Hassan',
    email: 'fatima.h@example.com',
    phone: '+971 55 987 6543',
    subject: 'Appointment Rescheduling',
    message: 'I need to reschedule my appointment that was set for October 5th. Is it possible to move it to October 7th?',
    status: 'read',
    createdAt: '2025-09-29T14:15:00Z',
    updatedAt: '2025-09-29T16:20:00Z'
  },
  {
    id: '3',
    name: 'Mohammed Khalid',
    email: 'mk@example.com',
    phone: '+971 54 555 1234',
    subject: 'Feedback on Service',
    message: 'I wanted to thank your team for the excellent service provided during my recent car inspection. The inspector was very professional.',
    status: 'replied',
    createdAt: '2025-09-28T09:45:00Z',
    updatedAt: '2025-09-28T11:30:00Z'
  },
  {
    id: '4',
    name: 'Sara Ahmed',
    email: 'sara.a@example.com',
    phone: '+971 56 222 7890',
    subject: 'Pricing Information',
    message: 'Could you please send me your current pricing list for all inspection services? I am interested in a full vehicle checkup.',
    status: 'archived',
    createdAt: '2025-09-25T13:10:00Z',
    updatedAt: '2025-09-26T10:05:00Z'
  },
  {
    id: '5',
    name: 'Omar Saeed',
    email: 'omar.s@example.com',
    phone: '+971 52 888 9999',
    subject: 'Technical Issue',
    message: 'I am having trouble booking an appointment through your website. The form keeps showing an error when I submit it.',
    status: 'new',
    createdAt: '2025-10-01T07:20:00Z',
    updatedAt: '2025-10-01T07:20:00Z'
  }
];
