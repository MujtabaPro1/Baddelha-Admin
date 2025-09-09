import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Send, Printer, Edit, Trash2, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { mockInvoices } from '../mock/invoiceData';
import { Invoice } from '../types/invoice';
import InvoicePreview from '../components/InvoicePreview';
import { toast } from 'react-toastify';

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch the invoice from an API
    const foundInvoice = mockInvoices.find(inv => inv.id === id);
    
    // Simulate API call
    setTimeout(() => {
      setInvoice(foundInvoice || null);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleEdit = () => {
    // In a real app, this would navigate to an edit page
    toast.info('Edit functionality would be implemented in a real app');
  };

  const handleDelete = () => {
    // In a real app, this would delete the invoice
    toast.success('Invoice deleted successfully');
    navigate('/invoicing');
  };

  const handleSendInvoice = () => {
    // In a real app, this would send the invoice via email
    toast.success('Invoice sent successfully!');
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

  const handleMarkAsPaid = () => {
    // In a real app, this would update the invoice status
    if (invoice) {
      setInvoice({
        ...invoice,
        status: 'paid'
      });
      toast.success('Invoice marked as paid');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' })
      .format(amount)
      .replace('SAR', 'Riyal');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div>
        <PageHeader 
          title="Invoice Not Found" 
          description="The requested invoice could not be found"
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
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-600 mb-4">The invoice you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/invoicing')}
            className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
          >
            Return to Invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title={`Invoice ${invoice.invoiceNumber}`} 
        description="View and manage invoice details"
      />
      
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/invoicing')}
          className="flex items-center text-blue-900 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Invoices</span>
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={handlePrintInvoice}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownloadInvoice}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1"
          >
            <Download size={16} />
            <span>Download</span>
          </button>
          {invoice.status !== 'paid' && (
            <button
              onClick={handleSendInvoice}
              className="px-3 py-1.5 bg-blue-900 text-white rounded-md hover:bg-blue-800 flex items-center gap-1"
            >
              <Send size={16} />
              <span>Send Invoice</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Invoice Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice Number:</span>
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created Date:</span>
              <span>{formatDate(invoice.dateCreated)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date:</span>
              <span>{formatDate(invoice.dueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-blue-900">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
          
          {invoice.status === 'draft' && (
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 border border-blue-900 text-blue-900 rounded-md hover:bg-blue-50 flex items-center justify-center gap-1"
              >
                <Edit size={16} />
                <span>Edit Invoice</span>
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 flex items-center justify-center gap-1"
              >
                <Trash2 size={16} />
                <span>Delete Invoice</span>
              </button>
            </div>
          )}
          
          {invoice.status === 'sent' && (
            <div className="mt-6">
              <button
                onClick={handleMarkAsPaid}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-1"
              >
                <Clock size={16} />
                <span>Mark as Paid</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Recipient Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600 block">Name:</span>
              <span className="font-medium">{invoice.recipient.name}</span>
            </div>
            <div>
              <span className="text-gray-600 block">Email:</span>
              <span>{invoice.recipient.email}</span>
            </div>
            {invoice.recipient.phone && (
              <div>
                <span className="text-gray-600 block">Phone:</span>
                <span>{invoice.recipient.phone}</span>
              </div>
            )}
            {invoice.recipient.address && (
              <div>
                <span className="text-gray-600 block">Address:</span>
                <span className="whitespace-pre-line">{invoice.recipient.address}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Vehicle Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600 block">Make & Model:</span>
              <span className="font-medium">{invoice.car.make} {invoice.car.model}</span>
            </div>
            <div>
              <span className="text-gray-600 block">Year:</span>
              <span>{invoice.car.year}</span>
            </div>
            {invoice.car.color && (
              <div>
                <span className="text-gray-600 block">Color:</span>
                <span>{invoice.car.color}</span>
              </div>
            )}
            {invoice.car.trim && (
              <div>
                <span className="text-gray-600 block">Trim:</span>
                <span>{invoice.car.trim}</span>
              </div>
            )}
            {invoice.car.vin && (
              <div>
                <span className="text-gray-600 block">VIN:</span>
                <span>{invoice.car.vin}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Invoice Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            
            {invoice.discount && invoice.discount > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-red-600">-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
              <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            
            <div className="flex justify-between py-3 border-t border-gray-200 font-bold">
              <span>Total:</span>
              <span className="text-blue-900">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {invoice.notes && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Notes</h3>
          <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Terms & Conditions</h3>
        <p className="text-gray-700 whitespace-pre-line">{invoice.termsAndConditions}</p>
      </div>
      
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setShowPreview(true)}
          className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
        >
          View Full Invoice
        </button>
      </div>
      
      {showPreview && (
        <InvoicePreview
          invoiceData={{
            recipient: invoice.recipient,
            car: invoice.car,
            items: invoice.items,
            dueDate: invoice.dueDate,
            taxRate: invoice.taxRate,
            discount: invoice.discount,
            notes: invoice.notes
          }}
          onClose={() => setShowPreview(false)}
          onSend={handleSendInvoice}
          onDownload={handleDownloadInvoice}
          onPrint={handlePrintInvoice}
        />
      )}
    </div>
  );
};

export default InvoiceDetail;
