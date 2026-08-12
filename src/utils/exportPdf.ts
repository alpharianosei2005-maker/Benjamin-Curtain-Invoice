import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Helper to ensure element styles are html2canvas compatible (converts modern CSS colors if needed).
 */
function sanitizeElementStyles(element: HTMLElement) {
  const allElements = [element, ...Array.from(element.querySelectorAll('*'))] as HTMLElement[];
  allElements.forEach((el) => {
    const style = window.getComputedStyle(el);
    
    // Replace oklch/unsupported colors with explicit rgb/hex fallbacks
    if (style.color && style.color.includes('oklch')) {
      el.style.color = '#0f172a';
    }
    if (style.backgroundColor && style.backgroundColor.includes('oklch')) {
      el.style.backgroundColor = '#ffffff';
    }
    if (style.borderColor && style.borderColor.includes('oklch')) {
      el.style.borderColor = '#cbd5e1';
    }
  });
}

/**
 * Downloads the targeted element as a high-resolution PDF file.
 */
export async function downloadInvoiceAsPdf(elementId: string, filename: string = 'Invoice.pdf'): Promise<void> {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Create an offscreen wrapper to guarantee visible rendering even if user is on mobile/edit mode
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.top = '-9999px';
  wrapper.style.left = '-9999px';
  wrapper.style.width = '794px'; // Standard A4 portrait width at 96 DPI
  wrapper.style.height = '1123px'; // Standard A4 portrait height at 96 DPI (210mm x 297mm)
  wrapper.style.zIndex = '-9999';
  wrapper.style.backgroundColor = '#ffffff';
  wrapper.style.padding = '0';
  wrapper.style.margin = '0';

  const clone = sourceElement.cloneNode(true) as HTMLElement;
  clone.style.display = 'flex';
  clone.style.flexDirection = 'column';
  clone.style.justifyContent = 'space-between';
  clone.style.visibility = 'visible';
  clone.style.width = '794px';
  clone.style.height = '1123px';
  clone.style.minHeight = '1123px';
  clone.style.boxSizing = 'border-box';
  clone.style.transform = 'none';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    sanitizeElementStyles(clone);

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
      onclone: (clonedDoc) => {
        const clonedTarget = clonedDoc.getElementById(elementId);
        if (clonedTarget) {
          clonedTarget.style.display = 'flex';
          clonedTarget.style.visibility = 'visible';
        }
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // Center on page if shorter than A4 height, else fit A4
    const yOffset = imgHeight < pdfHeight ? 0 : 0;

    pdf.addImage(imgData, 'JPEG', 0, yOffset, imgWidth, Math.min(imgHeight, pdfHeight));
    pdf.save(filename);
  } catch (error) {
    console.error('HTML2Canvas/jsPDF error, attempting fallback print window:', error);
    
    // Fallback strategy: create clean print window
    try {
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${filename}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: sans-serif; background: #fff; }
                @media print {
                  body { padding: 0; }
                  @page { size: A4; margin: 10mm; }
                }
              </style>
            </head>
            <body>
              ${clone.innerHTML}
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
        return;
      }
    } catch (fallbackErr) {
      console.error('Fallback print window failed:', fallbackErr);
    }

    throw error;
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
}

/**
 * Downloads the targeted element as a PNG image file.
 */
export async function downloadInvoiceAsImage(elementId: string, filename: string = 'Invoice.png'): Promise<void> {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.top = '-9999px';
  wrapper.style.left = '-9999px';
  wrapper.style.width = '794px';
  wrapper.style.height = '1123px';
  wrapper.style.zIndex = '-9999';
  wrapper.style.backgroundColor = '#ffffff';

  const clone = sourceElement.cloneNode(true) as HTMLElement;
  clone.style.display = 'flex';
  clone.style.flexDirection = 'column';
  clone.style.justifyContent = 'space-between';
  clone.style.visibility = 'visible';
  clone.style.width = '794px';
  clone.style.height = '1123px';
  clone.style.minHeight = '1123px';
  clone.style.boxSizing = 'border-box';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    sanitizeElementStyles(clone);

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
    });

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = filename;
    link.click();
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
}

/**
 * Generates a PDF File object for sharing or upload
 */
export async function generateInvoicePdfFile(elementId: string, filename: string = 'Invoice.pdf'): Promise<File> {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.top = '-9999px';
  wrapper.style.left = '-9999px';
  wrapper.style.width = '794px';
  wrapper.style.height = '1123px';
  wrapper.style.zIndex = '-9999';
  wrapper.style.backgroundColor = '#ffffff';

  const clone = sourceElement.cloneNode(true) as HTMLElement;
  clone.style.display = 'flex';
  clone.style.flexDirection = 'column';
  clone.style.justifyContent = 'space-between';
  clone.style.visibility = 'visible';
  clone.style.width = '794px';
  clone.style.height = '1123px';
  clone.style.minHeight = '1123px';
  clone.style.boxSizing = 'border-box';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    sanitizeElementStyles(clone);

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));

    const blob = pdf.output('blob');
    return new File([blob], filename, { type: 'application/pdf' });
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
}

/**
 * Generates a PNG image File object for sharing or upload
 */
export async function generateInvoiceImageFile(elementId: string, filename: string = 'Invoice.png'): Promise<File> {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.top = '-9999px';
  wrapper.style.left = '-9999px';
  wrapper.style.width = '794px';
  wrapper.style.height = '1123px';
  wrapper.style.zIndex = '-9999';
  wrapper.style.backgroundColor = '#ffffff';

  const clone = sourceElement.cloneNode(true) as HTMLElement;
  clone.style.display = 'flex';
  clone.style.flexDirection = 'column';
  clone.style.justifyContent = 'space-between';
  clone.style.visibility = 'visible';
  clone.style.width = '794px';
  clone.style.height = '1123px';
  clone.style.minHeight = '1123px';
  clone.style.boxSizing = 'border-box';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    sanitizeElementStyles(clone);

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
    });

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
    return new File([blob], filename, { type: 'image/png' });
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
}

/**
 * Shares the generated invoice PDF or image using the browser's native share sheet (WhatsApp, Telegram, Mail, etc.)
 */
export async function shareInvoiceFile(
  elementId: string,
  filename: string,
  fileType: 'pdf' | 'image',
  title: string,
  text: string
): Promise<boolean> {
  try {
    const file = fileType === 'pdf' 
      ? await generateInvoicePdfFile(elementId, filename)
      : await generateInvoiceImageFile(elementId, filename);

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text,
        files: [file],
      });
      return true;
    } else if (navigator.share) {
      await navigator.share({
        title,
        text,
      });
      return true;
    }
    return false;
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Share file error:', err);
    }
    return false;
  }
}

/**
 * Triggers native browser printing for the invoice element
 */
export function printInvoice(): void {
  window.print();
}
