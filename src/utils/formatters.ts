/**
 * Format numbers with commas (e.g. 61,242 or 22,695)
 */
export function formatAmount(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '0';
  // If integer or exact decimal, format cleanly
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Currency symbol formatter helper
 */
export function formatCurrency(amount: number, currencyCode: string = 'GHS'): string {
  const formattedNumber = formatAmount(amount);
  switch (currencyCode) {
    case 'GHS':
      return `GH₵ ${formattedNumber}`;
    case 'USD':
      return `$${formattedNumber}`;
    case 'EUR':
      return `€${formattedNumber}`;
    case 'GBP':
      return `£${formattedNumber}`;
    default:
      return `${currencyCode} ${formattedNumber}`;
  }
}

/**
 * Formats date into DD/MM/YYYY format matching sample invoice (08/08/2026)
 */
export function formatDateDDMMYYYY(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Returns today's date formatted as YYYY-MM-DD for HTML input[type="date"]
 */
export function getTodayISODate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate Next Invoice Number
 */
export function generateInvoiceNumber(existingCount: number = 0): string {
  const year = new Date().getFullYear();
  const sequence = String(existingCount + 1).padStart(3, '0');
  return `BCE-${year}-${sequence}`;
}
