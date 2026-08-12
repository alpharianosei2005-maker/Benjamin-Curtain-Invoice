import React, { useState, useEffect } from 'react';
import { Invoice, CompanyInfo, CatalogItem } from './types';
import { DEFAULT_COMPANY_INFO, DEFAULT_CATALOG, DEFAULT_NOTES } from './data/defaultCatalog';
import { getTodayISODate, generateInvoiceNumber } from './utils/formatters';
import { Header } from './components/Header';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { CatalogManager } from './components/CatalogManager';
import { InvoiceHistory } from './components/InvoiceHistory';
import { CompanySettingsModal } from './components/CompanySettingsModal';
import { AiScannerModal } from './components/AiScannerModal';
import { Edit3, Eye, Save, Check } from 'lucide-react';

const SAMPLE_INVOICE: Invoice = {
  id: 'sample-001',
  invoiceNumber: 'BCE-2026-001',
  documentType: 'PROFORMA INVOICE',
  date: '2026-08-08',
  customer: {
    name: 'Valued Client',
    phone: '0541-717-724',
  },
  items: [
    { id: 'item-1', description: 'Curtains', quantity: 232, price: 85, total: 19720 },
    { id: 'item-2', description: 'Voile', quantity: 232, price: 45, total: 10440 },
    { id: 'item-3', description: 'Rail', quantity: 25, price: 190, total: 4750 },
    { id: 'item-4', description: 'Tie Hook', quantity: 23, price: 65, total: 1495 },
    { id: 'item-5', description: 'Tie Back', quantity: 23, price: 85, total: 1955 },
    { id: 'item-6', description: 'L-Shape', quantity: 81, price: 20, total: 1620 },
    { id: 'item-7', description: 'Pinch Tape', quantity: 232, price: 10, total: 2320 },
    { id: 'item-8', description: 'Pinch Hook', quantity: 15, price: 35, total: 525 },
    { id: 'item-9', description: 'Curtain Hook', quantity: 15, price: 30, total: 450 },
    { id: 'item-10', description: 'Sewing', quantity: 464, price: 20, total: 9280 },
    { id: 'item-11', description: 'Blind', quantity: 23.8, price: 240, total: 5712 },
  ],
  subtotal: 61242,
  discount: 0,
  tax: 0,
  grossTotal: 61242,
  amountPaid: 0,
  balanceDue: 61242,
  currency: 'GHS',
  notes: DEFAULT_NOTES,
  status: 'Sent',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function App() {
  // Local Storage Persistent States
  const [company, setCompany] = useState<CompanyInfo>(() => {
    const saved = localStorage.getItem('bce_company');
    return saved ? JSON.parse(saved) : DEFAULT_COMPANY_INFO;
  });

  const [catalog, setCatalog] = useState<CatalogItem[]>(() => {
    const saved = localStorage.getItem('bce_catalog');
    return saved ? JSON.parse(saved) : DEFAULT_CATALOG;
  });

  const [savedInvoices, setSavedInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('bce_saved_invoices');
    return saved ? JSON.parse(saved) : [SAMPLE_INVOICE];
  });

  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(() => {
    const saved = localStorage.getItem('bce_current_draft');
    return saved ? JSON.parse(saved) : SAMPLE_INVOICE;
  });

  // UI Modal Controls
  const [showCatalog, setShowCatalog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Sync to Local Storage
  useEffect(() => {
    localStorage.setItem('bce_company', JSON.stringify(company));
  }, [company]);

  useEffect(() => {
    localStorage.setItem('bce_catalog', JSON.stringify(catalog));
  }, [catalog]);

  useEffect(() => {
    localStorage.setItem('bce_saved_invoices', JSON.stringify(savedInvoices));
  }, [savedInvoices]);

  useEffect(() => {
    localStorage.setItem('bce_current_draft', JSON.stringify(currentInvoice));
  }, [currentInvoice]);

  // Handlers
  const handleCreateNewInvoice = () => {
    const newInv: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(savedInvoices.length),
      documentType: 'PROFORMA INVOICE',
      date: getTodayISODate(),
      customer: { name: '', phone: '' },
      items: [
        { id: '1', description: 'Curtains', quantity: 1, price: 85, total: 85 },
      ],
      subtotal: 85,
      discount: 0,
      tax: 0,
      grossTotal: 85,
      amountPaid: 0,
      balanceDue: 85,
      currency: 'GHS',
      notes: DEFAULT_NOTES,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentInvoice(newInv);
    setActiveTab('edit');
  };

  const handleSaveToHistory = () => {
    const index = savedInvoices.findIndex((inv) => inv.id === currentInvoice.id);
    let updatedList: Invoice[];
    if (index >= 0) {
      updatedList = [...savedInvoices];
      updatedList[index] = { ...currentInvoice, updatedAt: new Date().toISOString() };
    } else {
      updatedList = [currentInvoice, ...savedInvoices];
    }
    setSavedInvoices(updatedList);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2000);
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const dup: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(savedInvoices.length),
      date: getTodayISODate(),
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentInvoice(dup);
    setActiveTab('edit');
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm('Delete this invoice record from history?')) {
      setSavedInvoices((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleScanComplete = (scanned: any) => {
    if (!scanned || !scanned.items) return;

    const items = scanned.items.map((it: any, idx: number) => ({
      id: String(idx + 1),
      description: it.description || 'Curtain Item',
      quantity: Number(it.quantity) || 1,
      price: Number(it.price) || 0,
      total: (Number(it.quantity) || 1) * (Number(it.price) || 0),
    }));

    const subtotal = items.reduce((sum: number, it: any) => sum + it.total, 0);

    const updated: Invoice = {
      ...currentInvoice,
      customer: {
        name: scanned.customerName || currentInvoice.customer.name,
        phone: scanned.customerPhone || currentInvoice.customer.phone,
      },
      invoiceNumber: scanned.invoiceNumber || currentInvoice.invoiceNumber,
      date: scanned.date || currentInvoice.date,
      items,
      subtotal,
      grossTotal: subtotal,
      balanceDue: subtotal,
      updatedAt: new Date().toISOString(),
    };

    setCurrentInvoice(updated);
    setActiveTab('edit');
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Header
        onNewInvoice={handleCreateNewInvoice}
        onOpenHistory={() => setShowHistory(true)}
        onOpenCatalog={() => setShowCatalog(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenScanner={() => setShowScanner(true)}
        savedInvoicesCount={savedInvoices.length}
        currentInvoiceNumber={currentInvoice.invoiceNumber}
        isSaved={saveSuccessMsg}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Sticky Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3 sm:gap-4">
            <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="hidden sm:inline">Draft:</span>
              <span className="font-mono text-indigo-950">{currentInvoice.invoiceNumber || 'BCE-2026-001'}</span>
            </h1>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                saveSuccessMsg
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}
            >
              {saveSuccessMsg ? 'Saved' : 'Drafting'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Toggle for desktop & mobile */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'edit'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'preview'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveToHistory}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm ${
                saveSuccessMsg
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {saveSuccessMsg ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Save Invoice</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Split / Dual Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Side */}
            <div
              className={`lg:col-span-6 space-y-6 ${
                activeTab === 'edit' ? 'block' : 'hidden lg:block'
              }`}
            >
              <InvoiceForm
                invoice={currentInvoice}
                onChange={setCurrentInvoice}
                catalog={catalog}
                onReset={() =>
                  setCurrentInvoice({
                    ...currentInvoice,
                    items: [{ id: '1', description: '', quantity: 1, price: 0, total: 0 }],
                    subtotal: 0,
                    grossTotal: 0,
                    balanceDue: 0,
                  })
                }
                onLoadSample={() => setCurrentInvoice(SAMPLE_INVOICE)}
              />
            </div>

            {/* Live Preview Side */}
            <div
              className={`lg:col-span-6 space-y-6 ${
                activeTab === 'preview' ? 'block' : 'hidden lg:block'
              }`}
            >
              <InvoicePreview invoice={currentInvoice} company={company} />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showCatalog && (
        <CatalogManager
          catalog={catalog}
          onUpdateCatalog={setCatalog}
          onClose={() => setShowCatalog(false)}
        />
      )}

      {showHistory && (
        <InvoiceHistory
          invoices={savedInvoices}
          onSelectInvoice={(inv) => {
            setCurrentInvoice(inv);
            setActiveTab('edit');
          }}
          onDuplicateInvoice={handleDuplicateInvoice}
          onDeleteInvoice={handleDeleteInvoice}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showSettings && (
        <CompanySettingsModal
          company={company}
          onSave={setCompany}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showScanner && (
        <AiScannerModal
          onScanComplete={handleScanComplete}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
