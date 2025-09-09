import React from 'react';
import { X, Download, Send, Printer } from 'lucide-react';
import { InvoiceFormData } from '../types/invoice';
import { generateInvoiceNumber, calculateInvoiceTotals } from '../mock/invoiceData';

interface InvoicePreviewProps {
  invoiceData: InvoiceFormData;
  onClose: () => void;
  onSend: () => void;
  onDownload: () => void;
  onPrint: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoiceData,
  onClose,
  onSend,
  onDownload,
  onPrint
}) => {
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

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const invoiceNumber = generateInvoiceNumber();
  
  const { subtotal, taxAmount, total } = calculateInvoiceTotals(
    invoiceData.items,
    invoiceData.taxRate,
    invoiceData.discount || 0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-full overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Invoice Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={onPrint}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              title="Print"
            >
              <Printer size={20} />
            </button>
            <button
              onClick={onDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              title="Download"
            >
              <Download size={20} />
            </button>
            <button
              onClick={onSend}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              title="Send"
            >
              <Send size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-8" id="invoice-print-area">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">INVOICE</h1>
              <p className="text-gray-600 mt-1">#{invoiceNumber}</p>
            </div>
            <div className="text-right">
              <div className="h-12 w-auto">
                <img 
                  src="/logo.png" 
                  alt="Baddelha Logo" 
                  className="h-full w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const logoText = document.getElementById('logo-text');
                    if (logoText) logoText.style.display = 'block';
                  }}
                />
                <div id="logo-text" className="hidden">
                  <h2 className="text-xl font-bold text-blue-900">Baddelha</h2>
                  <p className="text-sm text-gray-600">Premium Auto Services</p>
                </div>
              </div>
              <p className="text-gray-600 mt-2">
                123 King Fahd Road<br />
                Riyadh, Saudi Arabia<br />
                info@baddelha.com<br />
                +966 50 123 4567
              </p>
            </div>
          </div>
          
          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-gray-500 uppercase text-sm font-semibold mb-2">Bill To:</h3>
              <p className="font-medium">{invoiceData.recipient.name}</p>
              <p>{invoiceData.recipient.email}</p>
              {invoiceData.recipient.phone && <p>{invoiceData.recipient.phone}</p>}
              {invoiceData.recipient.address && <p className="whitespace-pre-line">{invoiceData.recipient.address}</p>}
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-gray-500 uppercase text-sm font-semibold mb-2">Invoice Date:</h3>
                  <p>{today}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 uppercase text-sm font-semibold mb-2">Due Date:</h3>
                  <p>{formatDate(invoiceData.dueDate)}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-gray-500 uppercase text-sm font-semibold mb-2">Vehicle:</h3>
                <p>
                  {invoiceData.car.make} {invoiceData.car.model} {invoiceData.car.year}
                  {invoiceData.car.color && ` • ${invoiceData.car.color}`}
                  {invoiceData.car.trim && ` • ${invoiceData.car.trim}`}
                </p>
                {invoiceData.car.vin && <p className="text-sm text-gray-600">VIN: {invoiceData.car.vin}</p>}
              </div>
            </div>
          </div>
          
          {/* Invoice Items */}
          <div className="mb-8">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Description
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-24">
                    Quantity
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-32">
                    Unit Price
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-32">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoiceData.items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="py-3 px-4 text-sm text-gray-800">{item.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 text-right">{item.quantity}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 text-right">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Invoice Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              {(invoiceData.discount && invoiceData.discount > 0) && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(invoiceData.discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tax ({invoiceData.taxRate}%):</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              
              <div className="flex justify-between py-3 border-t border-gray-200 font-bold">
                <span>Total:</span>
                <span className="text-blue-900">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          
          {/* Notes and Terms */}
          {invoiceData.notes && (
            <div className="mb-6">
              <h3 className="text-gray-500 uppercase text-sm font-semibold mb-2">Notes:</h3>
              <p className="text-gray-700 whitespace-pre-line">{invoiceData.notes}</p>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-gray-500 uppercase text-sm font-semibold mb-2">Terms & Conditions:</h3>
            <p className="text-gray-700">
              1. Payment is due within 14 days of invoice date.<br />
              2. Late payments are subject to a 5% fee.<br />
              3. All prices are in Saudi Riyal (SAR).<br />
              4. This invoice is subject to the terms of the sales agreement.
            </p>
          </div>
          
          {/* Thank You Message */}
          <div className="text-center mt-8 text-gray-600">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
