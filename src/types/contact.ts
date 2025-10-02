export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message?: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ContactResponse {
  data: Contact[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}
