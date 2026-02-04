export interface Lead {
  id: string | number;
  uid?: string;
  fullName: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  subject?: string;
  message: string;
  companyName?: string;
  location?: string;
  isSeller?: boolean;
  isBuyer?: boolean;
  createdAt: string;
  updatedAt?: string;
  status: 'new' | 'in-progress' | 'resolved' | 'rejected';
  notes?: string;
}
