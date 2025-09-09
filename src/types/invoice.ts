export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceRecipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface CarDetails {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  color?: string;
  trim?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  dateCreated: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  recipient: InvoiceRecipient;
  items: InvoiceItem[];
  car: CarDetails;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount?: number;
  total: number;
  notes?: string;
  termsAndConditions?: string;
}

export interface InvoiceFormData {
  recipient: InvoiceRecipient;
  car: CarDetails;
  items: InvoiceItem[];
  dueDate: string;
  taxRate: number;
  discount?: number;
  notes?: string;
}
