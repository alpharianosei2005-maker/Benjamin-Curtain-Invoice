export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address?: string;
  logoUrl?: string;
}

export type DocumentType = 'PROFORMA INVOICE' | 'INVOICE' | 'QUOTATION' | 'RECEIPT';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  documentType: DocumentType;
  date: string; // YYYY-MM-DD or DD/MM/YYYY
  dueDate?: string;
  customer: CustomerInfo;
  items: InvoiceItem[];
  subtotal: number;
  discount: number; // percentage or fixed
  tax: number;
  grossTotal: number;
  amountPaid: number;
  balanceDue: number;
  currency: string;
  notes: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  createdAt: string;
  updatedAt: string;
}

export interface CatalogItem {
  id: string;
  description: string;
  defaultPrice: number;
  category?: string;
}
