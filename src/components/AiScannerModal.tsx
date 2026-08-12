import React, { useState, useRef } from 'react';
import { Sparkles, Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface AiScannerModalProps {
  onScanComplete: (scannedData: {
    customerName?: string;
    customerPhone?: string;
    invoiceNumber?: string;
    date?: string;
    items: Array<{ description: string; quantity: number; price: number }>;
  }) => void;
  onClose: () => void;
}

export const AiScannerModal: React.FC<AiScannerModalProps> = ({
  onScanComplete,
  onClose,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/scan-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to analyze paper invoice image');
      }

      onScanComplete(resData.data);
      onClose();
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMsg(err.message || 'An error occurred while scanning the image.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <h2 className="text-base font-bold">AI Photo Invoice Scanner</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Snap or upload a photo of a handwritten invoice or paper order note. AI will automatically extract item names, quantities, and prices!
          </p>

          {/* Upload Area */}
          {!selectedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3 group"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-indigo-950">
                  Click or drag photo of handwritten invoice
                </p>
                <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP files</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-60 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Paper invoice preview"
                  className="max-h-60 w-auto object-contain"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white hover:bg-slate-900 rounded-full transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleScan}
            disabled={!selectedImage || isLoading}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
                <span>Extracting Invoice Items...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                <span>Scan & Auto-Fill Invoice</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
