import axiosInstance from './api';
import { Contact, ContactResponse } from '../types/contact';
import { mockContacts } from '../mock/contactsData';

// Flag to toggle between mock data and real API
const USE_MOCK_DATA = true;

/**
 * Fetch all contacts
 * @param page Optional page number for pagination
 * @param limit Optional limit of items per page
 * @returns Promise with contact data and metadata
 */
export const fetchContacts = async (page: number = 1, limit: number = 10): Promise<ContactResponse> => {
  if (USE_MOCK_DATA) {
    // Simulate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedContacts = mockContacts.slice(startIndex, endIndex);
    
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        data: [...paginatedContacts],
        meta: {
          total: mockContacts.length,
          page,
          limit
        }
      }), 800);
    });
  }
  
  try {
    const response = await axiosInstance.get('1.0/contact/find-all', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

/**
 * Fetch a single contact by ID
 * @param id Contact ID
 * @returns Promise with contact data
 */
export const fetchContactById = async (id: string): Promise<Contact> => {
  if (USE_MOCK_DATA) {
    const contact = mockContacts.find(contact => contact.id === id);
    if (!contact) throw new Error(`Contact with ID ${id} not found`);
    
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve({...contact}), 500);
    });
  }
  
  try {
    const response = await axiosInstance.get(`1.0/contact/find/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching contact with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Update contact status
 * @param id Contact ID
 * @param status New status
 * @returns Promise with updated contact data
 */
export const updateContactStatus = async (id: string, status: Contact['status']): Promise<Contact> => {
  if (USE_MOCK_DATA) {
    const contactIndex = mockContacts.findIndex(contact => contact.id === id);
    if (contactIndex === -1) throw new Error(`Contact with ID ${id} not found`);
    
    // Update the contact in our mock data
    mockContacts[contactIndex] = {
      ...mockContacts[contactIndex],
      status,
      updatedAt: new Date().toISOString()
    };
    
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve({...mockContacts[contactIndex]}), 500);
    });
  }
  
  try {
    const response = await axiosInstance.patch(`1.0/contact/update-status/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating contact status for ID ${id}:`, error);
    throw error;
  }
};
