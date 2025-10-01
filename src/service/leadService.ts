import axiosInstance from './api';
import { Lead } from '../types/lead';
import { mockLeads } from '../mock/leadsData';

// Flag to toggle between mock data and real API
const USE_MOCK_DATA = true;

// Fetch all leads
export const fetchLeads = async (): Promise<Lead[]> => {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockLeads]), 800);
    });
  }
  
  try {
    const response = await axiosInstance.get('1.0/leads');
    return response.data;
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
};

// Fetch a single lead by ID
export const fetchLeadById = async (id: string): Promise<Lead> => {
  if (USE_MOCK_DATA) {
    const lead = mockLeads.find(lead => lead.id === id);
    if (!lead) throw new Error(`Lead with ID ${id} not found`);
    
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve({...lead}), 500);
    });
  }
  
  try {
    const response = await axiosInstance.get(`1.0/leads/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching lead with ID ${id}:`, error);
    throw error;
  }
};

// Update lead status
export const updateLeadStatus = async (id: string, status: Lead['status'], notes?: string): Promise<Lead> => {
  if (USE_MOCK_DATA) {
    const leadIndex = mockLeads.findIndex(lead => lead.id === id);
    if (leadIndex === -1) throw new Error(`Lead with ID ${id} not found`);
    
    // Update the lead in our mock data
    mockLeads[leadIndex] = {
      ...mockLeads[leadIndex],
      status,
      notes: notes || mockLeads[leadIndex].notes
    };
    
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve({...mockLeads[leadIndex]}), 500);
    });
  }
  
  try {
    const response = await axiosInstance.patch(`1.0/leads/${id}/status`, { status, notes });
    return response.data;
  } catch (error) {
    console.error(`Error updating lead status for ID ${id}:`, error);
    throw error;
  }
};

// Add notes to a lead
export const addLeadNotes = async (id: string, notes: string): Promise<Lead> => {
  if (USE_MOCK_DATA) {
    const leadIndex = mockLeads.findIndex(lead => lead.id === id);
    if (leadIndex === -1) throw new Error(`Lead with ID ${id} not found`);
    
    // Update the lead in our mock data
    mockLeads[leadIndex] = {
      ...mockLeads[leadIndex],
      notes
    };
    
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve({...mockLeads[leadIndex]}), 500);
    });
  }
  
  try {
    const response = await axiosInstance.patch(`1.0/leads/${id}/notes`, { notes });
    return response.data;
  } catch (error) {
    console.error(`Error adding notes to lead with ID ${id}:`, error);
    throw error;
  }
};
