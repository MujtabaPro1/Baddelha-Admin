import { Invoice, InvoiceRecipient } from '../types/invoice';

// Mock recipients data
export const mockRecipients: InvoiceRecipient[] = [
  {
    id: '1',
    name: 'Ahmed Al-Saud',
    email: 'ahmed@example.com',
    phone: '+966 50 123 4567',
    address: '123 King Fahd Road, Riyadh, Saudi Arabia'
  },
  {
    id: '2',
    name: 'Fatima Al-Harbi',
    email: 'fatima@example.com',
    phone: '+966 55 987 6543',
    address: '456 Tahlia Street, Jeddah, Saudi Arabia'
  },
  {
    id: '3',
    name: 'Mohammed Al-Qahtani',
    email: 'mohammed@example.com',
    phone: '+966 54 555 7890',
    address: '789 Prince Sultan Road, Dammam, Saudi Arabia'
  },
  {
    id: '4',
    name: 'Noura Al-Otaibi',
    email: 'noura@example.com',
    phone: '+966 56 222 3333',
    address: '321 Olaya Street, Riyadh, Saudi Arabia'
  },
  {
    id: '5',
    name: 'Khalid Al-Ghamdi',
    email: 'khalid@example.com',
    phone: '+966 59 444 5555',
    address: '654 Palestine Street, Jeddah, Saudi Arabia'
  }
];

// Mock invoices data
export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2025-001',
    dateCreated: '2025-09-01T10:00:00Z',
    dueDate: '2025-09-15T10:00:00Z',
    status: 'sent',
    recipient: mockRecipients[0],
    car: {
      id: 'car1',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      vin: 'JT2BF22K1W0123456',
      color: 'Silver',
      trim: 'SE'
    },
    items: [
      {
        id: 'item1',
        description: 'Toyota Camry 2023 - Silver',
        quantity: 1,
        unitPrice: 120000,
        total: 120000
      },
      {
        id: 'item2',
        description: 'Extended Warranty Package',
        quantity: 1,
        unitPrice: 5000,
        total: 5000
      },
      {
        id: 'item3',
        description: 'Premium Maintenance Package',
        quantity: 1,
        unitPrice: 3000,
        total: 3000
      }
    ],
    subtotal: 128000,
    taxRate: 15,
    taxAmount: 19200,
    total: 147200,
    notes: 'Thank you for your business!',
    termsAndConditions: 'Payment due within 14 days. Late payments subject to 5% fee.'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2025-002',
    dateCreated: '2025-09-03T14:30:00Z',
    dueDate: '2025-09-17T14:30:00Z',
    status: 'paid',
    recipient: mockRecipients[1],
    car: {
      id: 'car2',
      make: 'Lexus',
      model: 'ES',
      year: 2024,
      vin: 'JTHBK1GG7E2123456',
      color: 'White',
      trim: 'Premium'
    },
    items: [
      {
        id: 'item1',
        description: 'Lexus ES 2024 - White',
        quantity: 1,
        unitPrice: 195000,
        total: 195000
      },
      {
        id: 'item2',
        description: 'Premium Protection Package',
        quantity: 1,
        unitPrice: 8500,
        total: 8500
      }
    ],
    subtotal: 203500,
    taxRate: 15,
    taxAmount: 30525,
    discount: 5000,
    total: 229025,
    notes: 'Paid in full on delivery.',
    termsAndConditions: 'All sales are final. Warranty as per manufacturer terms.'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2025-003',
    dateCreated: '2025-09-05T09:15:00Z',
    dueDate: '2025-09-19T09:15:00Z',
    status: 'draft',
    recipient: mockRecipients[2],
    car: {
      id: 'car3',
      make: 'BMW',
      model: '5 Series',
      year: 2024,
      vin: 'WBAXH5C53DD123456',
      color: 'Black',
      trim: 'M Sport'
    },
    items: [
      {
        id: 'item1',
        description: 'BMW 5 Series 2024 - Black',
        quantity: 1,
        unitPrice: 280000,
        total: 280000
      },
      {
        id: 'item2',
        description: 'Technology Package',
        quantity: 1,
        unitPrice: 15000,
        total: 15000
      },
      {
        id: 'item3',
        description: 'Premium Sound System',
        quantity: 1,
        unitPrice: 8000,
        total: 8000
      }
    ],
    subtotal: 303000,
    taxRate: 15,
    taxAmount: 45450,
    total: 348450,
    notes: 'Draft invoice - pending final approval',
    termsAndConditions: 'Payment terms: 50% deposit required to confirm order.'
  }
];

// Function to generate a new invoice number
export const generateInvoiceNumber = (): string => {
  const currentYear = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `INV-${currentYear}-${randomNum}`;
};

// Function to calculate invoice totals
export const calculateInvoiceTotals = (
  items: Invoice['items'],
  taxRate: number,
  discount: number = 0
): { subtotal: number; taxAmount: number; total: number } => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + taxAmount;
  
  return {
    subtotal,
    taxAmount,
    total
  };
};
