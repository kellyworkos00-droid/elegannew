'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Product {
  name: string;
  sku: string;
}

interface PosOrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: Product;
}

interface PosOrder {
  id: string;
  orderNumber: string;
  orderItems: PosOrderItem[];
}

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
}

interface Customer {
  name: string;
  email: string | null;
  phone: string | null;
  billingAddress: string | null;
  customerCode: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  description: string | null;
  notes: string | null;
  customer: Customer;
  payments: Payment[];
  posOrders: PosOrder[];
}

export default function InvoicePrintPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/invoices/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch invoice');

        const data = await response.json();
        setInvoice(data.data.invoice);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInvoice();
    }
  }, [params.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">Invoice not found</p>
        </div>
      </div>
    );
  }

  // Collect all line items from POS orders
  const lineItems = invoice.posOrders.flatMap(order =>
    order.orderItems.map(item => ({
      description: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.totalPrice,
    }))
  );

  return (
    <>
      {/* Print button - hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 shadow-lg hover:bg-blue-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          Print Invoice
        </button>
      </div>

      {/* Invoice Document - Single A4 Page */}
      <div className="min-h-screen bg-gray-50 print:bg-white py-4 print:py-0 px-4 print:px-0">
        <div className="invoice-print-container max-w-4xl mx-auto bg-white shadow-lg print:shadow-none p-6 print:p-8 print:m-0" style={{ minHeight: 'auto' }}>
          {/* Professional Header */}
          <div className="border-b-4 border-blue-600 pb-4 mb-4">
            <div className="grid grid-cols-3 gap-4 items-start mb-3">
              {/* Left: Company Logo & Name */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image src="/images/elegant-logo.jpg" alt="Elegant Steel Logo" fill className="object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-blue-900">ELEGANT STEEL</h1>
                  <p className="text-xs text-gray-600">EASTERN BYPASS</p>
                </div>
              </div>
              {/* Center: INVOICE Title */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
                <p className="text-sm font-semibold text-blue-600 mt-1">{invoice.invoiceNumber}</p>
              </div>
              {/* Right: Tax & Contact Info */}
              <div className="text-right text-xs space-y-1">
                <p className="font-semibold">KRA PIN: <span className="text-blue-600">P000000000A</span></p>
                <p className="text-gray-700">📞 0726788925 / 0111478454</p>
                <p className="text-gray-700">📍 Eastern Bypass, Nairobi</p>
              </div>
            </div>
            {/* Dates */}
            <div className="grid grid-cols-3 gap-4 text-sm pt-3 border-t border-gray-200">
              <div>
                <p className="text-gray-600 font-semibold text-xs uppercase">Issued</p>
                <p className="font-bold text-gray-900">{formatDate(invoice.issueDate)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 font-semibold text-xs uppercase">Due</p>
                <p className="font-bold text-gray-900">{formatDate(invoice.dueDate)}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold uppercase px-3 py-1 rounded inline-block ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : invoice.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                  {invoice.status.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Customer & Items Section */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
            {/* Bill To */}
            <div>
              <p className="font-bold text-gray-900 uppercase text-xs mb-2">Bill To</p>
              <p className="font-semibold text-gray-900">{invoice.customer.name}</p>
              {invoice.customer.billingAddress && <p className="text-gray-600 text-xs">{invoice.customer.billingAddress}</p>}
              {invoice.customer.phone && <p className="text-gray-600 text-xs">Tel: {invoice.customer.phone}</p>}
            </div>
            {/* Items Count */}
            <div className="bg-blue-50 p-3 rounded text-center border-2 border-blue-200">
              <p className="font-bold text-gray-900 text-lg">{lineItems.length}</p>
              <p className="text-gray-600 text-xs font-semibold">Line Items</p>
            </div>
            {/* Tax Info */}
            <div className="bg-amber-50 p-3 rounded text-right border-2 border-amber-200">
              <p className="text-xs text-gray-600 font-semibold">VAT Rate</p>
              <p className="font-bold text-amber-700 text-lg">16%</p>
              <p className="text-xs text-gray-600">Included in Total</p>
            </div>
          </div>

          {/* Line Items Table */}
          {lineItems.length > 0 && (
            <div className="mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-100 border-b-2 border-blue-600">
                    <th className="text-left py-2 px-3 font-bold text-gray-900">Description</th>
                    <th className="text-center py-2 px-2 font-bold text-gray-900 w-16">Qty</th>
                    <th className="text-right py-2 px-3 font-bold text-gray-900 w-24">Unit Price</th>
                    <th className="text-right py-2 px-3 font-bold text-gray-900 w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-2 px-3 text-gray-900">{item.description}</td>
                      <td className="py-2 px-2 text-center text-gray-900 font-medium">{item.quantity}</td>
                      <td className="py-2 px-3 text-right text-gray-900">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2 px-3 text-right text-gray-900 font-semibold">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals Section */}
          <div className="border-t-2 border-gray-300 pt-3">
            <div className="flex justify-end">
              <div className="w-72">
                <div className="flex justify-between text-sm py-1.5">
                  <span className="text-gray-700 font-semibold">Subtotal:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm py-1.5 border-b-2 border-gray-300">
                  <span className="text-gray-700 font-semibold">VAT @ 16%:</span>
                  <span className="font-semibold text-amber-700">{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg py-2 font-bold bg-gradient-to-r from-blue-50 to-blue-100 px-3 rounded my-2">
                  <span className="text-gray-900">TOTAL DUE:</span>
                  <span className="text-blue-900">{formatCurrency(invoice.totalAmount)}</span>
                </div>
                {invoice.paidAmount > 0 && (
                  <>
                    <div className="flex justify-between text-sm py-1.5 text-green-700 font-semibold">
                      <span>Amount Paid:</span>
                      <span>{formatCurrency(invoice.paidAmount)}</span>
                    </div>
                    {invoice.balanceAmount > 0 && (
                      <div className="flex justify-between text-sm py-1.5 bg-orange-50 px-3 rounded text-orange-800 font-bold">
                        <span>Balance Due:</span>
                        <span>{formatCurrency(invoice.balanceAmount)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <div className="mt-4 text-xs">
              <p className="font-bold text-gray-900 uppercase mb-2 border-b-2 border-gray-300 pb-1">Payment History</p>
              <div className="space-y-1">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between bg-gray-50 p-2 px-3 rounded border-l-4 border-green-500">
                    <span className="text-gray-700 font-medium">{formatDate(payment.paymentDate)} - {payment.paymentMethod}</span>
                    <span className="font-bold text-green-700">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t-2 border-gray-300 pt-3 mt-4 text-center text-xs text-gray-600">
            <p className="font-bold text-gray-900 mb-1 text-sm">Thank you for your business!</p>
            <p className="text-gray-600 leading-relaxed">VAT is included in all prices above. This is a computer-generated document and requires no signature for validity.</p>
            <p className="text-gray-500 mt-2 font-semibold">Elegant Steel | Eastern Bypass | KRA PIN: P000000000A</p>
            <p className="text-gray-400 mt-1 text-xs">Printed on {formatDate(new Date().toISOString())}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          * { 
            margin: 0; 
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          html, body { 
            margin: 0; 
            padding: 0 !important; 
            width: 100%; 
            background: white !important;
          }
          
          @page { 
            size: A4;
            margin: 0;
          }
          
          /* Hide print button when printing */
          div:has(> button) { display: none !important; }
          button { display: none !important; }
          
          /* Show invoice container */
          .invoice-print-container {
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            background: white !important;
            margin: 0 !important;
            padding: 0.5cm !important;
            max-width: none !important;
          }
          
          /* Ensure text and colors are visible */
          p, span, div, td, th { 
            color: inherit !important;
          }
          
          /* Keep backgrounds and colors */
          div[class*="bg-"] {
            background: inherit !important;
          }
          
          /* Prevent unnecessary page breaks */
          table { page-break-inside: avoid !important; }
          tr { page-break-inside: avoid !important; }
        }
      `}</style>
    </>
  );
}
