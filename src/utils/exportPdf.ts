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
  wrapper.style.width = '800px'; // Approx A4 width at 96 DPI
  wrapper.style.zIndex = '-9999';
  wrapper.style.backgroundColor = '#ffffff';
  wrapper.style.padding = '0';
  wrapper.style.margin = '0';

  const clone = sourceElement.cloneNode(true) as HTMLElement;
  clone.style.display = 'block';
  clone.style.visibility = 'visible';
  clone.style.width = '800px';
  clone.style.minHeight = '1120px';
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
      width: 800,
      windowWidth: 800,
      onclone: (clonedDoc) => {
        const clonedTarget = clonedDoc.getElementById(elementId);
        if (clonedTarget) {
          clonedTarget.style.display = 'block';
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
  wrapper.style.width = '800px';
  wrapper.style.zIndex = '-9999';
  wrapper.style.backgroundColor = '#ffffff';

  const clone = sourceElement.cloneNode(true) as HTMLElement;
  clone.style.display = 'block';
  clone.style.visibility = 'visible';
  clone.style.width = '800px';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    sanitizeElementStyles(clone);

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 800,
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
 * Triggers native browser printing for the invoice element
 */
export function printInvoice(): void {
  window.print();
}
