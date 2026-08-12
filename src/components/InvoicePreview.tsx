import React, { useState } from 'react';
import { Invoice, CompanyInfo } from '../types';
import { formatDateDDMMYYYY, formatAmount } from '../utils/formatters';
import { downloadInvoiceAsPdf, downloadInvoiceAsImage, printInvoice } from '../utils/exportPdf';
import { Download, Image as ImageIcon, Printer, Share2, Check, Copy } from 'lucide-react';

interface InvoicePreviewProps {
  invoice: Invoice;
  company: CompanyInfo;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, company }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const documentId = 'invoice-paper-preview';

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      const filename = `${invoice.documentType.replace(/\s+/g, '_')}_${invoice.invoiceNumber || 'BCE'}.pdf`;
      await downloadInvoiceAsPdf(documentId, filename);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadImage = async () => {
    setIsExporting(true);
    try {
      const filename = `${invoice.documentType.replace(/\s+/g, '_')}_${invoice.invoiceNumber || 'BCE'}.png`;
      await downloadInvoiceAsImage(documentId, filename);
    } catch (err) {
      console.error('Image export failed:', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleWhatsAppShare = () => {
    const summary = `*${company.name}*\n*${invoice.documentType}*\nInvoice #: ${invoice.invoiceNumber || 'N/A'}\nDate: ${formatDateDDMMYYYY(invoice.date)}\nCustomer: ${invoice.customer.name || 'Valued Client'}\n------------------\nTotal Items: ${invoice.items.length}\n*Gross Total: ${invoice.currency} ${formatAmount(invoice.grossTotal)}*\n------------------\n${company.tagline}\nContact: ${company.phone}`;
    
    // Clean phone number for WhatsApp
    const phone = invoice.customer.phone ? invoice.customer.phone.replace(/[^0-9]/g, '') : '';
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(summary)}`
      : `https://wa.me/?text=${encodeURIComponent(summary)}`;

    window.open(url, '_blank');
  };

  const copySummaryText = () => {
    const lines = invoice.items.map(
      (item) => `• ${item.description}: ${item.quantity} x ${item.price} = ${formatAmount(item.total)}`
    ).join('\n');
    const fullText = `${company.name} - ${invoice.documentType}\nInvoice #: ${invoice.invoiceNumber}\nDate: ${formatDateDDMMYYYY(invoice.date)}\nCustomer: ${invoice.customer.name} (${invoice.customer.phone})\n\nITEMS:\n${lines}\n\nGROSS TOTAL: ${invoice.currency} ${formatAmount(invoice.grossTotal)}\n${company.phone}`;
    
    navigator.clipboard.writeText(fullText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Export Action Controls Bar */}
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Export Options:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* PDF Download */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          {/* Image PNG Download */}
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Save as PNG Image</span>
          </button>

          {/* WhatsApp Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white px-3 py-2 rounded-xl transition-all active:scale-95"
            title="Send summary to WhatsApp"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Copy Text */}
          <button
            type="button"
            onClick={copySummaryText}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            title="Copy text summary"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={printInvoice}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            title="Print document"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Outer Paper Frame Wrapper for precise A4 ratio look */}
      <div className="bg-slate-200/70 p-3 sm:p-6 rounded-2xl shadow-inner overflow-x-auto flex justify-center">
        {/* Printable Document Sheet matching Benjamin's Curtain Enterprise sample */}
        <div
          id={documentId}
          className="bg-white text-slate-900 w-[210mm] min-h-[297mm] p-[12mm] sm:p-[15mm] shadow-xl rounded-none font-serif flex flex-col justify-between text-slate-900 border border-slate-300"
          style={{ boxSizing: 'border-box' }}
        >
          <div>
            {/* Document Header Section */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-300">
              {/* Company Branding Left */}
              <div className="max-w-[62%] space-y-1">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f3458] uppercase font-serif leading-tight">
                  {company.name}
                </h1>
                <p className="text-[10px] sm:text-[11px] text-slate-600 italic font-sans leading-tight">
                  {company.tagline}
                </p>
                <div className="pt-2 text-[11px] sm:text-xs font-sans text-slate-800 font-semibold space-y-0.5">
                  <div>CONTACT: {company.phone}</div>
                  <div>Email:{company.email}</div>
                  {invoice.customer.name && (
                    <div className="text-slate-900 pt-1 font-bold">
                      CLIENT: <span className="underline">{invoice.customer.name}</span>
                      {invoice.customer.phone && ` (${invoice.customer.phone})`}
                    </div>
                  )}
                </div>
              </div>

              {/* Document Meta Right */}
              <div className="text-right space-y-1">
                <h2 className="text-lg sm:text-2xl font-extrabold text-[#5bb2c7] tracking-wider uppercase font-sans">
                  {invoice.documentType}
                </h2>
                <div className="text-xs sm:text-sm font-sans font-bold text-slate-800 pt-2 space-y-1">
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
            <div className="mb-6">
              <table className="w-full border-collapse text-left text-xs sm:text-sm font-sans border border-slate-400">
                <thead>
                  <tr className="border-b border-slate-400 text-[#0f3458] font-bold uppercase tracking-wider text-[11px] sm:text-xs bg-slate-50">
                    <th className="p-2 sm:p-2.5 border-r border-slate-400 w-[46%]">DESCRIPTION</th>
                    <th className="p-2 sm:p-2.5 border-r border-slate-400 text-center w-[18%]">QUANTITY</th>
                    <th className="p-2 sm:p-2.5 border-r border-slate-400 text-right w-[18%]">PRICE</th>
                    <th className="p-2 sm:p-2.5 text-right w-[18%]">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-slate-300">
                      <td className="p-2 sm:p-2.5 border-r border-slate-400 font-medium text-slate-800">
                        {item.description || '—'}
                      </td>
                      <td className="p-2 sm:p-2.5 border-r border-slate-400 text-center font-mono">
                        {item.quantity || 0}
                      </td>
                      <td className="p-2 sm:p-2.5 border-r border-slate-400 text-right font-mono">
                        {formatAmount(item.price)}
                      </td>
                      <td className="p-2 sm:p-2.5 text-right font-mono font-semibold">
                        {formatAmount(item.total)}
                      </td>
                    </tr>
                  ))}

                  {/* Empty pad rows if needed to fill document */}
                  {Array.from({ length: Math.max(0, 8 - invoice.items.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-300 text-transparent">&nbsp;</td>
                      <td className="p-2 border-r border-slate-300">&nbsp;</td>
                      <td className="p-2 border-r border-slate-300">&nbsp;</td>
                      <td className="p-2">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Total Section matching sample */}
            <div className="flex justify-between items-end mt-4 pt-2">
              <div className="text-xs font-sans text-slate-600 space-y-1">
                {invoice.notes && (
                  <div className="font-bold text-[#0f3458] tracking-wide text-xs sm:text-sm uppercase">
                    {invoice.notes}
                  </div>
                )}
              </div>

              {/* Big Gross Total Display */}
              <div className="flex items-stretch border-2 border-[#0f3458]">
                <div className="bg-slate-50 text-[#0f3458] font-bold text-xs sm:text-sm px-3 py-2 flex flex-col justify-center text-center uppercase tracking-wider border-r border-[#0f3458] font-sans">
                  <span>GROSS TOTAL</span>
                  {invoice.discount > 0 && <span className="text-[10px] text-slate-500">(NET)</span>}
                </div>
                <div className="text-2xl sm:text-4xl font-extrabold text-[#0f3458] px-4 py-2 flex items-center font-mono">
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
