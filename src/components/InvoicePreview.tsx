import React, { useState } from 'react';
import { Invoice, CompanyInfo } from '../types';
import { formatDateDDMMYYYY, formatAmount } from '../utils/formatters';
import { 
  downloadInvoiceAsPdf, 
  downloadInvoiceAsImage, 
  printInvoice,
  shareInvoiceFile
} from '../utils/exportPdf';
import { 
  Download, 
  Image as ImageIcon, 
  Printer, 
  Share2, 
  Check, 
  Copy, 
  Mail, 
  Send, 
  MessageSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface InvoicePreviewProps {
  invoice: Invoice;
  company: CompanyInfo;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, company }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const documentId = 'invoice-paper-preview';
  const fileNamePdf = `${invoice.documentType.replace(/\s+/g, '_')}_${invoice.invoiceNumber || 'BCE'}.pdf`;
  const fileNameImage = `${invoice.documentType.replace(/\s+/g, '_')}_${invoice.invoiceNumber || 'BCE'}.png`;

  const getSummaryText = () => {
    const itemLines = invoice.items.map(
      (item) => `• ${item.description}: ${item.quantity} x GH₵${formatAmount(item.price)} = GH₵${formatAmount(item.total)}`
    ).join('\n');

    return `*${company.name}*\n*${invoice.documentType}*\nInvoice #: ${invoice.invoiceNumber || 'N/A'}\nDate: ${formatDateDDMMYYYY(invoice.date)}\nClient: ${invoice.customer.name || 'Valued Client'} ${invoice.customer.phone ? `(${invoice.customer.phone})` : ''}\n\n*SUMMARY OF ITEMS:*\n${itemLines}\n\n*GROSS TOTAL: ${invoice.currency} ${formatAmount(invoice.grossTotal)}*\n\nContact: ${company.phone}\nEmail: ${company.email}`;
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setExportStatus('Generating PDF...');
    try {
      await downloadInvoiceAsPdf(documentId, fileNamePdf);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setExportStatus(null);
    }
  };

  const handleDownloadImage = async () => {
    setIsExporting(true);
    setExportStatus('Generating PNG Image...');
    try {
      await downloadInvoiceAsImage(documentId, fileNameImage);
    } catch (err) {
      console.error('Image export failed:', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsExporting(false);
      setExportStatus(null);
    }
  };

  // Direct Native App Share (File PDF / Image via Native Share Sheet to WhatsApp, Telegram, Gmail, Mail, Drive, etc.)
  const handleNativeShareFile = async (type: 'pdf' | 'image') => {
    setIsExporting(true);
    setExportStatus(`Preparing ${type.toUpperCase()} for sharing...`);
    
    const filename = type === 'pdf' ? fileNamePdf : fileNameImage;
    const title = `${company.name} - ${invoice.documentType} ${invoice.invoiceNumber}`;
    const text = getSummaryText();

    try {
      const shared = await shareInvoiceFile(documentId, filename, type, title, text);
      if (!shared) {
        // Fallback: download file and pop open sharing options modal
        if (type === 'pdf') {
          await downloadInvoiceAsPdf(documentId, filename);
        } else {
          await downloadInvoiceAsImage(documentId, filename);
        }
        setShowShareModal(true);
      }
    } catch (err) {
      console.error('Share failed:', err);
      setShowShareModal(true);
    } finally {
      setIsExporting(false);
      setExportStatus(null);
    }
  };

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    const summary = getSummaryText();
    const phone = invoice.customer.phone ? invoice.customer.phone.replace(/[^0-9]/g, '') : '';
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(summary)}`
      : `https://wa.me/?text=${encodeURIComponent(summary)}`;

    window.open(url, '_blank');
  };

  // Telegram Share
  const handleTelegramShare = () => {
    const summary = getSummaryText();
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(summary)}`;
    window.open(url, '_blank');
  };

  // Email Share
  const handleEmailShare = () => {
    const subject = `${company.name} - ${invoice.documentType} (${invoice.invoiceNumber || 'BCE'})`;
    const body = getSummaryText();
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const copySummaryText = () => {
    navigator.clipboard.writeText(getSummaryText());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Export & Apps Action Controls Bar */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Export & Direct App Sharing
            </span>
          </div>
          {exportStatus && (
            <span className="text-xs text-indigo-300 font-semibold animate-pulse">
              {exportStatus}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Share PDF File to Apps (Native Share Sheet: WhatsApp, Telegram, Drive, Mail) */}
          <button
            type="button"
            onClick={() => handleNativeShareFile('pdf')}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3.5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Share actual PDF file directly to WhatsApp, Telegram, Email, or Files"
          >
            <Share2 className="w-4 h-4 text-yellow-300" />
            <span>Share PDF to App</span>
          </button>

          {/* Share Image to Apps */}
          <button
            type="button"
            onClick={() => handleNativeShareFile('image')}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-3.5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Share image file directly to WhatsApp, Telegram, or Photos"
          >
            <ImageIcon className="w-4 h-4 text-emerald-200" />
            <span>Share Image to App</span>
          </button>

          {/* Quick Direct Apps Divider */}
          <div className="h-6 w-px bg-slate-800 hidden sm:block mx-1" />

          {/* Direct WhatsApp button */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer"
            title="Send formatted breakdown via WhatsApp"
          >
            <MessageSquare className="w-4 h-4 text-emerald-300" />
            <span>WhatsApp</span>
          </button>

          {/* Direct Telegram button */}
          <button
            type="button"
            onClick={handleTelegramShare}
            className="flex items-center gap-1.5 text-xs font-bold bg-sky-700 hover:bg-sky-600 text-white px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer"
            title="Send via Telegram"
          >
            <Send className="w-4 h-4 text-sky-200" />
            <span>Telegram</span>
          </button>

          {/* Direct Email button */}
          <button
            type="button"
            onClick={handleEmailShare}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-2 rounded-xl border border-slate-700 transition-all active:scale-95 cursor-pointer"
            title="Send via Email app"
          >
            <Mail className="w-4 h-4 text-purple-300" />
            <span>Email</span>
          </button>

          {/* Download PDF button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Download PDF file"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Copy Text */}
          <button
            type="button"
            onClick={copySummaryText}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Copy text summary"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={printInvoice}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Print document"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Share Fallback Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                <span>Export & Share Options</span>
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your invoice file has been generated! Choose how you would like to send it to your client:
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  handleWhatsAppShare();
                  setShowShareModal(false);
                }}
                className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-xl font-semibold text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Send to WhatsApp Chat</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              </button>

              <button
                onClick={() => {
                  handleTelegramShare();
                  setShowShareModal(false);
                }}
                className="w-full flex items-center justify-between p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 rounded-xl font-semibold text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4 text-sky-600" />
                  <span>Send to Telegram</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
              </button>

              <button
                onClick={() => {
                  handleEmailShare();
                  setShowShareModal(false);
                }}
                className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 rounded-xl font-semibold text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-purple-600" />
                  <span>Send via Email Client</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outer Paper Frame Wrapper for precise A4 ratio look */}
      <div className="bg-slate-200/70 p-2 sm:p-6 rounded-2xl shadow-inner flex justify-center w-full max-w-full overflow-hidden">
        {/* Printable Document Sheet matching Benjamin's Curtain Enterprise sample */}
        <div
          id={documentId}
          className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[auto] sm:min-h-[280mm] p-4 sm:p-[15mm] shadow-xl rounded-none font-serif flex flex-col justify-between text-slate-900 border border-slate-300"
          style={{ boxSizing: 'border-box' }}
        >
          <div>
            {/* Document Header Section */}
            <div className="flex justify-between items-start mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-300">
              {/* Company Branding Left */}
              <div className="max-w-[62%] space-y-0.5 sm:space-y-1">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-[#0f3458] uppercase font-serif leading-tight">
                  {company.name}
                </h1>
                <p className="text-[9px] sm:text-[11px] text-slate-600 italic font-sans leading-tight">
                  {company.tagline}
                </p>
                <div className="pt-1.5 sm:pt-2 text-[10px] sm:text-xs font-sans text-slate-800 font-semibold space-y-0.5">
                  <div>CONTACT: {company.phone}</div>
                  <div>Email:{company.email}</div>
                  {invoice.customer.name && (
                    <div className="text-slate-900 pt-0.5 font-bold">
                      CLIENT: <span className="underline">{invoice.customer.name}</span>
                      {invoice.customer.phone && ` (${invoice.customer.phone})`}
                    </div>
                  )}
                </div>
              </div>

              {/* Document Meta Right */}
              <div className="text-right space-y-0.5 sm:space-y-1">
                <h2 className="text-base sm:text-2xl font-extrabold text-[#5bb2c7] tracking-wider uppercase font-sans">
                  {invoice.documentType}
                </h2>
                <div className="text-[11px] sm:text-sm font-sans font-bold text-slate-800 pt-1 sm:pt-2 space-y-0.5 sm:space-y-1">
                  <div>
                    INVOICE: <span className="font-mono">{invoice.invoiceNumber || '…………………'}</span>
                  </div>
                  <div>
                    DATE: <span className="underline">{formatDateDDMMYYYY(invoice.date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Grid Table */}
            <div className="mb-4 sm:mb-6 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm font-sans border border-slate-400">
                <thead>
                  <tr className="border-b border-slate-400 text-[#0f3458] font-bold uppercase tracking-wider text-[10px] sm:text-xs bg-slate-50">
                    <th className="p-1.5 sm:p-2.5 border-r border-slate-400 w-[46%]">DESCRIPTION</th>
                    <th className="p-1.5 sm:p-2.5 border-r border-slate-400 text-center w-[18%]">QUANTITY</th>
                    <th className="p-1.5 sm:p-2.5 border-r border-slate-400 text-right w-[18%]">PRICE</th>
                    <th className="p-1.5 sm:p-2.5 text-right w-[18%]">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-slate-300">
                      <td className="p-1.5 sm:p-2.5 border-r border-slate-400 font-medium text-slate-800">
                        {item.description || '—'}
                      </td>
                      <td className="p-1.5 sm:p-2.5 border-r border-slate-400 text-center font-mono">
                        {item.quantity || 0}
                      </td>
                      <td className="p-1.5 sm:p-2.5 border-r border-slate-400 text-right font-mono">
                        {formatAmount(item.price)}
                      </td>
                      <td className="p-1.5 sm:p-2.5 text-right font-mono font-semibold">
                        {formatAmount(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Total Section matching sample */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 mt-4 pt-2">
              <div className="text-xs font-sans text-slate-600 space-y-1">
                {invoice.notes && (
                  <div className="font-bold text-[#0f3458] tracking-wide text-xs sm:text-sm uppercase">
                    {invoice.notes}
                  </div>
                )}
              </div>

              {/* Big Gross Total Display */}
              <div className="self-end inline-flex border-2 border-[#0f3458] bg-white items-stretch shrink-0 max-w-full my-0">
                <div className="bg-slate-50 text-[#0f3458] font-bold text-[10px] sm:text-xs px-3 sm:px-4 py-2 sm:py-3 flex flex-col items-center justify-center text-center uppercase tracking-wider border-r-2 border-[#0f3458] font-sans whitespace-nowrap leading-normal">
                  <span>GROSS TOTAL</span>
                  {invoice.discount > 0 && <span className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5">(NET)</span>}
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0f3458] px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-center font-sans tracking-tight whitespace-nowrap leading-normal">
                  {formatAmount(invoice.grossTotal)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="pt-8 text-center text-xs text-slate-500 font-sans border-t border-slate-200 mt-8">
            <p className="font-bold text-[#0f3458] uppercase tracking-wider text-xs">
              {company.name} • {company.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
