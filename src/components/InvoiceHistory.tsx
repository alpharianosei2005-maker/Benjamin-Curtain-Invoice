import React, { useState } from 'react';
import { Invoice } from '../types';
import { formatDateDDMMYYYY, formatAmount } from '../utils/formatters';
import { X, Search, FileText, Copy, Trash2, ArrowRight } from 'lucide-react';

interface InvoiceHistoryProps {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onClose: () => void;
}

export const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({
  invoices,
  onSelectInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer.phone.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Saved Invoices History</h2>
            <p className="text-xs text-slate-400">
              {invoices.length} saved {invoices.length === 1 ? 'invoice' : 'invoices'} on this device
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by client name, phone, or invoice #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Invoices List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-medium">No saved invoices found</p>
            </div>
          ) : (
            filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-300 transition-all space-y-2.5 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {inv.invoiceNumber}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">
                      {inv.customer.name || 'Unnamed Client'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {formatDateDDMMYYYY(inv.date)} • {inv.customer.phone || 'No phone'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold font-mono text-slate-900">
                      {inv.currency} {formatAmount(inv.grossTotal)}
                    </span>
                    <div className="mt-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'Sent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{inv.items.length} line items</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onDuplicateInvoice(inv)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                      title="Duplicate invoice"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Duplicate</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectInvoice(inv);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                    >
                      <span>Load</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteInvoice(inv.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete invoice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
