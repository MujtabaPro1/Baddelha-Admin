import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePreview from '../components/InvoicePreview';
import { InvoiceFormData } from '../types/invoice';
import { toast } from 'react-toastify';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [currentInvoiceData, setCurrentInvoiceData] = useState<InvoiceFormData | null>(null);

  const handleFormSubmit = (_data: InvoiceFormData) => {
    // In a real app, this would send the data to an API
    // For now, we'll just show a success message and navigate back

    // In a real app, we would save this to the database
    // For now, we'll just show a success message and navigate back
    toast.success('Invoice created successfully!');
    navigate('/invoicing');
  };

  const handleCancel = () => {
    navigate('/invoicing');
  };

  const handlePreview = (data: InvoiceFormData) => {
    setCurrentInvoiceData(data);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const handleSendInvoice = () => {
    // In a real app, this would send the invoice via email
    toast.success('Invoice sent successfully!');
    setShowPreview(false);
    navigate('/invoicing');
  };

  const handleDownloadInvoice = () => {
    // In a real app, this would generate a PDF and download it
    toast.info('Downloading invoice...');
    
    // Simulate download delay
    setTimeout(() => {
      toast.success('Invoice downloaded successfully!');
    }, 1500);
  };

  const handlePrintInvoice = () => {
    // This would trigger the print dialog
    window.print();
  };

  return (
    <div>
      <PageHeader 
        title="Create Invoice" 
        description="Create a new invoice for a vehicle sale"
      />
      
      <div className="mb-6">
        <button
          onClick={() => navigate('/invoicing')}
          className="flex items-center text-blue-900 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Invoices</span>
        </button>
      </div>
      
      <InvoiceForm 
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
        onPreview={handlePreview}
      />

      {showPreview && currentInvoiceData && (
        <InvoicePreview
          invoiceData={currentInvoiceData}
          onClose={handleClosePreview}
          onSend={handleSendInvoice}
          onDownload={handleDownloadInvoice}
          onPrint={handlePrintInvoice}
        />
      )}
    </div>
  );
};

export default CreateInvoice;
