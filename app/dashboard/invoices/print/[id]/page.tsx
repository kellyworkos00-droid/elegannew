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
        <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none p-6 print:p-6" style={{ minHeight: 'auto' }}>
          {/* Professional Header */}
          <div className="border-b-4 border-blue-600 pb-3 mb-3">
            <div className="grid grid-cols-3 gap-4 items-start mb-2">
              {/* Left: Company Logo & Name */}
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image src="/images/elegant-logo.jpg" alt="Elegant Steel Logo" fill className="object-contain" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-blue-900">ELEGANT STEEL</h1>
                  <p className="text-xs text-gray-600 leading-none">EASTERN BYPASS</p>
                </div>
              </div>
              {/* Center: INVOICE Title */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                <p className="text-xs font-semibold text-blue-600">{invoice.invoiceNumber}</p>
              </div>
              {/* Right: Tax & Contact Info */}
              <div className="text-right text-xs space-y-0.5">
                <p><span className="font-semibold">PIN:</span> 0726788925</p>
                <p><span className="font-semibold">Ref:</span> 0111478454</p>
                <p className="text-gray-600 font-medium">Eastern Bypass, Nairobi</p>
              </div>
            </div>
            {/* Dates */}
            <div className="grid grid-cols-3 gap-4 text-xs pt-2 border-t border-gray-200">
              <div><p className="text-gray-600 font-medium">Issued:</p><p className="font-semibold">{formatDate(invoice.issueDate)}</p></div>
              <div className="text-center"><p className="text-gray-600 font-medium">Due:</p><p className="font-semibold">{formatDate(invoice.dueDate)}</p></div>
              <div className="text-right">
                <p className={`text-xs font-bold uppercase px-2 py-0.5 rounded inline-block ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : invoice.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                  {invoice.status.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Customer & Items Section */}
          <div className="grid grid-cols-3 gap-3 mb-2 text-xs">
            {/* Bill To */}
            <div>
              <p className="font-bold text-gray-900 uppercase text-xs mb-1">Bill To</p>
              <p className="font-semibold text-gray-900 leading-snug">{invoice.customer.name}</p>
              {invoice.customer.billingAddress && <p className="text-gray-600 text-xs leading-snug">{invoice.customer.billingAddress}</p>}
              {invoice.customer.phone && <p className="text-gray-600 text-xs">Tel: {invoice.customer.phone}</p>}
            </div>
            {/* Items Count */}
            <div className="bg-blue-50 p-2 rounded text-center">
              <p className="font-bold text-gray-900 text-base">{lineItems.length}</p>
              <p className="text-gray-600 text-xs">Items</p>
            </div>
            {/* Tax Info */}
            <div className="bg-amber-50 p-2 rounded text-right">
              <p className="text-xs text-gray-600 font-semibold">VAT Rate</p>
              <p className="font-bold text-amber-700">16%</p>
              <p className="text-xs text-gray-600">Included</p>
            </div>
          </div>

          {/* Line Items Table */}
          {lineItems.length > 0 && (
            <div className="mb-2 max-h-72 overflow-y-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="sticky top-0">
                  <tr className="bg-blue-100 border-b-2 border-blue-600">
                    <th className="text-left py-1.5 px-2 font-bold text-gray-900">Description</th>
                    <th className="text-center py-1.5 px-1 font-bold text-gray-900 w-10">Qty</th>
                    <th className="text-right py-1.5 px-2 font-bold text-gray-900 w-20">Unit Price</th>
                    <th className="text-right py-1.5 px-2 font-bold text-gray-900 w-20">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-1 px-2 text-gray-900">{item.description}</td>
                      <td className="py-1 px-1 text-center text-gray-900 font-medium">{item.quantity}</td>
                      <td className="py-1 px-2 text-right text-gray-900">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-1 px-2 text-right text-gray-900 font-semibold">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals Section */}
          <div className="border-t-2 border-gray-300 pt-2">
            <div className="flex justify-end ">
              <div className="w-64">
                <div className="flex justify-between text-xs py-1">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b-2 border-gray-300">
                  <span className="text-gray-600">VAT @ 16%:</span>
                  <span className="font-semibold text-amber-700">{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm py-1.5 font-bold bg-gradient-to-r from-blue-50 to-blue-100 px-2 rounded">
                  <span className="text-gray-900">TOTAL:</span>
                  <span className="text-blue-900">{formatCurrency(invoice.totalAmount)}</span>
                </div>
                {invoice.paidAmount > 0 && (
                  <>
                    <div className="flex justify-between text-xs py-1 mt-1 text-green-700">
                      <span>Paid:</span>
                      <span className="font-semibold">{formatCurrency(invoice.paidAmount)}</span>
                    </div>
                    {invoice.balanceAmount > 0 && (
                      <div className="flex justify-between text-xs py-1 bg-orange-50 px-2 rounded text-orange-700 font-bold">
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
            <div className="mt-2 text-xs">
              <p className="font-bold text-gray-900 uppercase mb-1">Payment History</p>
              <div className="space-y-0.5">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between bg-gray-50 p-1 px-2 rounded">
                    <span className="text-gray-600">{formatDate(payment.paymentDate)} - {payment.paymentMethod}</span>
                    <span className="font-semibold text-green-700">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-300 pt-2 mt-2 text-center text-xs text-gray-600">
            <p className="font-semibold text-gray-900 mb-0.5">Thank you for your business!</p>
            <p className="text-gray-500 text-xs leading-tight">VAT is included in all prices. This is a computer-generated document and is valid without a signature.</p>
            <p className="text-gray-400 text-xs mt-0.5">Elegant Steel | Eastern Bypass | PIN: 0726788925</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; background: white; }
          @page { size: A4; margin: 1cm; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </>
  );
}
