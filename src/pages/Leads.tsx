import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { Lead } from '../types/lead';
import { fetchLeads } from '../service/leadService';
import LeadStatusModal from '../components/LeadStatusModal';
import LeadDetailsModal from '../components/LeadDetailsModal';
import { toast } from 'react-toastify';

const Leads = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    getLeads();
  }, []);

  const getLeads = async () => {
    setLoading(true);
    try {
      const data = await fetchLeads();
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const openStatusModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
  };
  
  const openDetailsModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
  };

  const getStatusBadgeClass = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-900 text-white';
      case 'resolved':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter leads based on search query and status
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus ? lead.status === selectedStatus : true;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <PageHeader 
        title="Leads" 
        description="Manage leads from the contact form on the website"
      />
      

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 animated-transition">
                <td className="font-medium text-gray-900">{lead.fullName}</td>
                <td>{lead.email}</td>
                <td>{lead.phone}</td>
                <td>{lead.subject}</td>
                <td>{formatDate(lead.createdAt)}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(lead.status)} capitalize`}>
                    {lead.status.replace('-', ' ')}
                  </span>
                </td>
                <td>
                  <div className="flex gap-3">
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-900"
                      onClick={() => openDetailsModal(lead)}
                    >
                      View
                    </button>
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-900"
                      onClick={() => openStatusModal(lead)}
                    >
                      Update Status
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredLeads.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">
              {loading ? 'Loading leads...' : 'No leads found matching your criteria.'}
            </p>
          </div>
        )}
      </div>

      {/* Lead status modal */}
      <LeadStatusModal
        lead={selectedLead}
        isOpen={isStatusModalOpen}
        onClose={closeStatusModal}
        onStatusUpdate={getLeads}
      />

      {/* Lead details modal */}
      <LeadDetailsModal
        lead={selectedLead}
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        onUpdateClick={(lead) => {
          closeDetailsModal();
          openStatusModal(lead);
        }}
      />
    </div>
  );
};

export default Leads;
