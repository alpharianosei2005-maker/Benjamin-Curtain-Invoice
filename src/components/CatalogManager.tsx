import React, { useState } from 'react';
import { CatalogItem } from '../types';
import { DEFAULT_CATALOG } from '../data/defaultCatalog';
import { X, Plus, Trash2, Edit2, Check, RefreshCw, Search } from 'lucide-react';

interface CatalogManagerProps {
  catalog: CatalogItem[];
  onUpdateCatalog: (newCatalog: CatalogItem[]) => void;
  onClose: () => void;
}

export const CatalogManager: React.FC<CatalogManagerProps> = ({
  catalog,
  onUpdateCatalog,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);

  // New item inputs
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [newCat, setNewCat] = useState('Accessories');

  const filtered = catalog.filter((item) =>
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || newPrice === '') return;

    const newItem: CatalogItem = {
      id: Date.now().toString(),
      description: newDesc.trim(),
      defaultPrice: Number(newPrice),
      category: newCat,
    };

    onUpdateCatalog([...catalog, newItem]);
    setNewDesc('');
    setNewPrice('');
  };

  const startEdit = (item: CatalogItem) => {
    setEditingId(item.id);
    setEditDesc(item.description);
    setEditPrice(item.defaultPrice);
  };

  const saveEdit = (id: string) => {
    const updated = catalog.map((item) =>
      item.id === id ? { ...item, description: editDesc, defaultPrice: editPrice } : item
    );
    onUpdateCatalog(updated);
    setEditingId(null);
  };

  const removeItem = (id: string) => {
    onUpdateCatalog(catalog.filter((item) => item.id !== id));
  };

  const handleResetCatalog = () => {
    if (confirm("Reset catalog back to Benjamin's default price list?")) {
      onUpdateCatalog(DEFAULT_CATALOG);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Catalog & Default Prices Manager</h2>
            <p className="text-xs text-slate-400">
              Manage pre-saved curtain items, default prices, and autocomplete keywords
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Add Item Form */}
          <form
            onSubmit={handleAddItem}
            className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Add New Item to Catalog
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Description (e.g. Tassel)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              />
              <input
                type="number"
                placeholder="Default Price (GH₵)"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </form>

          {/* Search & Reset Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search catalog items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={handleResetCatalog}
              className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg flex items-center gap-1 font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
          </div>

          {/* Items List */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No items found in catalog.</div>
            ) : (
              filtered.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="px-2 py-1 text-sm border border-slate-300 rounded flex-1"
                      />
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="px-2 py-1 text-sm border border-slate-300 rounded w-24 text-right"
                      />
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{item.description}</span>
                        {item.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-bold text-indigo-700">
                          GH₵ {item.defaultPrice}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                            title="Edit price"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            title="Remove from catalog"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
