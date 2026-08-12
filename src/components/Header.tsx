import React, { useState } from 'react';
import { Plus, History, BookOpen, Settings, Sparkles, Circle, Menu, X } from 'lucide-react';

interface HeaderProps {
  onNewInvoice: () => void;
  onOpenHistory: () => void;
  onOpenCatalog: () => void;
  onOpenSettings: () => void;
  onOpenScanner: () => void;
  savedInvoicesCount: number;
  currentInvoiceNumber: string;
  isSaved: boolean;
  activeTab: 'edit' | 'preview';
  setActiveTab: (tab: 'edit' | 'preview') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewInvoice,
  onOpenHistory,
  onOpenCatalog,
  onOpenSettings,
  onOpenScanner,
  savedInvoicesCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Navigation Header (< md) */}
      <div className="md:hidden bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center justify-between px-3 py-2.5">
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow">
              B
            </div>
            <div>
              <div className="font-bold text-white text-xs tracking-tight">
                Benjamin's Curtain Enterprise
              </div>
              <p className="text-[9px] text-indigo-300">Invoice & Billing System</p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onNewInvoice();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>

            <button
              onClick={() => {
                onOpenScanner();
                setMobileMenuOpen(false);
              }}
              className="p-1.5 bg-purple-900/60 border border-indigo-500/30 text-yellow-400 rounded-lg active:scale-95"
              title="AI Photo Scanner"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 active:scale-95"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="bg-slate-900/98 border-t border-slate-800 px-4 py-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">
              Quick Workspace Links
            </div>

            <button
              onClick={() => {
                onOpenHistory();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-white rounded-lg text-xs font-medium"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-indigo-400" />
                <span>Invoices History</span>
              </div>
              {savedInvoicesCount > 0 && (
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {savedInvoicesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenCatalog();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-white rounded-lg text-xs font-medium"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Prices Catalog</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-white rounded-lg text-xs font-medium"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Company Profile</span>
            </button>
          </div>
        )}
      </div>

      {/* Desktop Sidebar Navigation (>= md) */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col min-h-screen border-r border-slate-800 shrink-0">
        <div className="p-5 flex-1 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-900/30">
              B
            </div>
            <div>
              <div className="font-bold text-white tracking-tight text-sm leading-tight">
                Benjamin's Curtain Enterprise
              </div>
              <p className="text-[11px] text-indigo-300">Invoice & Billing System</p>
            </div>
          </div>

          {/* Primary Action: New Invoice */}
          <button
            onClick={onNewInvoice}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg shadow-sm transition-colors active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </button>

          {/* AI Scanner Banner */}
          <button
            onClick={onOpenScanner}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-900/80 hover:to-indigo-900/80 border border-indigo-500/30 text-white rounded-lg text-xs font-semibold transition-all group"
          >
            <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-white font-bold">AI Photo Scanner</div>
              <div className="text-[10px] text-indigo-200">Scan paper invoice note</div>
            </div>
          </button>

          {/* Navigation Section */}
          <nav className="space-y-1">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-2">
              Workspace
            </div>

            <button
              onClick={onOpenHistory}
              className="w-full flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-md transition-colors text-sm font-medium"
            >
              <div className="flex items-center gap-3">
                <History className="w-4 h-4 text-indigo-400" />
                <span>Invoices History</span>
              </div>
              {savedInvoicesCount > 0 && (
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
                  {savedInvoicesCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCatalog}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-md transition-colors text-sm font-medium"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Prices Catalog</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-md transition-colors text-sm font-medium"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Company Profile</span>
            </button>
          </nav>
        </div>

        {/* System Status Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
            System Status
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
            <span className="text-slate-300 font-medium">PDF Engine Ready</span>
          </div>
        </div>
      </aside>
    </>
  );
};


