import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Downloads the targeted element as a high-resolution PDF file.
 */
export async function downloadInvoiceAsPdf(elementId: string, filename: string = 'Invoice.pdf'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Temporary class or clone tweak for optimal rendering
  const canvas = await html2canvas(element, {
    scale: 3, // High DPI rendering
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1200,
  });

  const imgData = canvas.toDataURL('image/png');
  
  // Calculate A4 proportions
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 10; // Margin top

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  pdf.save(filename);
}

/**
 * Downloads the targeted element as a PNG image file.
 */
export async function downloadInvoiceAsImage(elementId: string, filename: string = 'Invoice.png'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1200,
  });

  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = image;
  link.download = filename;
  link.click();
}

/**
 * Triggers native browser printing for the invoice element
 */
export function printInvoice(): void {
  window.print();
}
