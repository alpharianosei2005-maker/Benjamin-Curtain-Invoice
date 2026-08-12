import React from 'react';
import { Invoice, InvoiceItem, CatalogItem, DocumentType } from '../types';
import { SmartItemInput } from './SmartItemInput';
import { Plus, Trash2, RefreshCw, Layers, Calculator, User, Phone, Calendar, Hash } from 'lucide-react';

interface InvoiceFormProps {
  invoice: Invoice;
  onChange: (updatedInvoice: Invoice) => void;
  catalog: CatalogItem[];
  onReset: () => void;
  onLoadSample: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  onChange,
  catalog,
  onReset,
  onLoadSample,
}) => {
  // Quick update helpers
  const handleFieldChange = (field: keyof Invoice, value: any) => {
    onChange({ ...invoice, [field]: value });
  };

  const handleCustomerChange = (field: string, value: string) => {
    onChange({
      ...invoice,
      customer: { ...invoice.customer, [field]: value },
    });
  };

  const updateItem = (index: number, updates: Partial<InvoiceItem>) => {
    const updatedItems = [...invoice.items];
    const current = updatedItems[index];

    const description = updates.description !== undefined ? updates.description : current.description;
    const quantity = updates.quantity !== undefined ? updates.quantity : current.quantity;
    const price = updates.price !== undefined ? updates.price : current.price;
    const total = quantity * price;

    updatedItems[index] = {
      ...current,
      description,
      quantity,
      price,
      total,
    };

    recalculateAndNotify(updatedItems);
  };

  const addItem = (description: string = '', price: number = 0) => {
    const newItem: InvoiceItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      description,
      quantity: 1,
      price,
      total: price,
    };

    recalculateAndNotify([...invoice.items, newItem]);
  };

  const removeItem = (index: number) => {
    if (invoice.items.length <= 1) {
      // Clear line instead of dropping if only 1 item left
      const cleared = [...invoice.items];
      cleared[0] = { ...cleared[0], description: '', quantity: 1, price: 0, total: 0 };
      recalculateAndNotify(cleared);
      return;
    }
    const updated = invoice.items.filter((_, i) => i !== index);
    recalculateAndNotify(updated);
  };

  const recalculateAndNotify = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const grossTotal = Math.max(0, subtotal - (invoice.discount || 0) + (invoice.tax || 0));
    const balanceDue = Math.max(0, grossTotal - (invoice.amountPaid || 0));

    onChange({
      ...invoice,
      items,
      subtotal,
      grossTotal,
      balanceDue,
    });
  };

  // Quick Preset Add
  const handleAddPreset = (item: CatalogItem) => {
    // If the last item is empty, replace it, else add new
    const lastItem = invoice.items[invoice.items.length - 1];
    if (lastItem && !lastItem.description.trim() && lastItem.total === 0) {
      updateItem(invoice.items.length - 1, {
        description: item.description,
        price: item.defaultPrice,
      });
    } else {
      addItem(item.description, item.defaultPrice);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-6">
      {/* Document Type & Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Document Type
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(['PROFORMA INVOICE', 'INVOICE', 'QUOTATION', 'RECEIPT'] as DocumentType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleFieldChange('documentType', type)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  invoice.documentType === type
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLoadSample}
            className="text-xs px-2.5 py-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-medium rounded-lg border border-indigo-200 flex items-center gap-1 transition-colors"
            title="Load sample proforma invoice data from Benjamin's Curtain Enterprise"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Load Sample</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="text-xs px-2.5 py-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg flex items-center gap-1 transition-colors"
            title="Clear all fields"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Customer & Document Metadata Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
        {/* Customer Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-600" /> Customer Name
          </label>
          <input
            type="text"
            value={invoice.customer.name}
            onChange={(e) => handleCustomerChange('name', e.target.value)}
            placeholder="e.g. Mr. Kojo Mensah or Client Name"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          />
        </div>

        {/* Customer Contact */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-indigo-600" /> Customer Phone Number
          </label>
          <input
            type="text"
            value={invoice.customer.phone}
            onChange={(e) => handleCustomerChange('phone', e.target.value)}
            placeholder="e.g. 024-000-0000"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Invoice Date
          </label>
          <input
            type="date"
            value={invoice.date}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          />
        </div>

        {/* Invoice Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-indigo-600" /> Invoice #
          </label>
          <input
            type="text"
            value={invoice.invoiceNumber}
            onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
            placeholder="e.g. BCE-2026-001"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-mono"
          />
        </div>
      </div>

      {/* Quick Catalog Shortcuts Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick Add Frequent Curtain Items:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {catalog.slice(0, 10).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleAddPreset(item)}
              className="text-xs px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-md font-medium transition-colors flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3 h-3 text-indigo-600" />
              <span>{item.description}</span>
              <span className="text-[10px] text-indigo-600 font-semibold">
                ({item.defaultPrice})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Line Items Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-indigo-600" />
            Line Items ({invoice.items.length})
          </h3>
          <span className="text-xs text-slate-500">
            Smart autocomplete active. Type keywords like "cur", "rail", "blind"
          </span>
        </div>

        {/* Desktop / Table View */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-left border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 text-xs font-bold border-b border-slate-200">
                <th className="py-2.5 px-3 w-[45%]">DESCRIPTION</th>
                <th className="py-2.5 px-3 w-[18%]">QTY</th>
                <th className="py-2.5 px-3 w-[18%]">PRICE (GH₵)</th>
                <th className="py-2.5 px-3 w-[15%] text-right">TOTAL</th>
                <th className="py-2.5 px-2 w-[4%] text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-sm bg-white">
              {invoice.items.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-slate-50/70 transition-colors">
                  {/* Smart Autocomplete Description */}
                  <td className="p-2">
                    <SmartItemInput
                      value={item.description}
                      onChange={(desc, price) => {
                        updateItem(index, {
                          description: desc,
                          ...(price !== undefined ? { price } : {}),
                        });
                      }}
                      catalog={catalog}
                      placeholder={`Item ${index + 1} (e.g. Curtains, Voile)`}
                    />
                  </td>

                  {/* Quantity */}
                  <td className="p-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={item.quantity === 0 ? '' : item.quantity}
                      onChange={(e) => {
                        const qty = parseFloat(e.target.value) || 0;
                        updateItem(index, { quantity: qty });
                      }}
                      placeholder="1"
                      className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center font-medium"
                    />
                  </td>

                  {/* Price */}
                  <td className="p-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={item.price === 0 ? '' : item.price}
                      onChange={(e) => {
                        const p = parseFloat(e.target.value) || 0;
                        updateItem(index, { price: p });
                      }}
                      placeholder="0"
                      className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-right font-medium"
                    />
                  </td>

                  {/* Line Total */}
                  <td className="p-2 text-right font-bold text-slate-800">
                    {(item.quantity * item.price).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* Delete Item */}
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        <button
          type="button"
          onClick={() => addItem('', 0)}
          className="w-full py-2.5 border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-700 hover:bg-indigo-50 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Line Item</span>
        </button>
      </div>

      {/* Totals & Notes Section */}
      <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes & Currency */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Footer Note / Terms
            </label>
            <input
              type="text"
              value={invoice.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. THANK YOU FOR YOUR BUSINESS!"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency
              </label>
              <select
                value={invoice.currency}
                onChange={(e) => handleFieldChange('currency', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="GHS">GHS (GH₵)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={invoice.status}
                onChange={(e) => handleFieldChange('status', e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calculation Summary Box */}
        <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2.5 shadow-inner">
          <div className="flex justify-between text-sm text-slate-300">
            <span>Subtotal:</span>
            <span className="font-mono font-medium">
              {invoice.currency} {invoice.subtotal.toLocaleString('en-US')}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm text-slate-300">
            <span>Discount:</span>
            <div className="w-28 flex items-center">
              <input
                type="number"
                min="0"
                value={invoice.discount || ''}
                onChange={(e) => {
                  const disc = parseFloat(e.target.value) || 0;
                  const gross = Math.max(0, invoice.subtotal - disc);
                  onChange({
                    ...invoice,
                    discount: disc,
                    grossTotal: gross,
                    balanceDue: Math.max(0, gross - (invoice.amountPaid || 0)),
                  });
                }}
                placeholder="0"
                className="w-full px-2 py-1 text-xs bg-slate-800 text-white border border-slate-700 rounded text-right"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
            <span className="text-base font-bold text-indigo-300 uppercase tracking-wide">
              GROSS TOTAL:
            </span>
            <span className="text-2xl font-extrabold text-indigo-400 font-mono">
              {invoice.grossTotal.toLocaleString('en-US')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
