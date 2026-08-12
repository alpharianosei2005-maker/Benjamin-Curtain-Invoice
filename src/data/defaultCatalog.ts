import { CompanyInfo, CatalogItem } from '../types';

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: "BENJAMIN'S CURTAIN ENTERPRISE",
  tagline: "EXPERTS IN: Interior decoration and Curtain Accessories, Curtain Repairs, Blinds",
  phone: "0541-717-724",
  email: "Fredericktbarima@gmail.com",
  address: "Accra, Ghana",
};

export const DEFAULT_CATALOG: CatalogItem[] = [
  { id: '1', description: 'Curtains', defaultPrice: 85, category: 'Fabrics' },
  { id: '2', description: 'Voile', defaultPrice: 45, category: 'Fabrics' },
  { id: '3', description: 'Rail', defaultPrice: 190, category: 'Hardware' },
  { id: '4', description: 'Tie Hook', defaultPrice: 65, category: 'Accessories' },
  { id: '5', description: 'Tie Back', defaultPrice: 85, category: 'Accessories' },
  { id: '6', description: 'L-Shape', defaultPrice: 20, category: 'Hardware' },
  { id: '7', description: 'Pinch Tape', defaultPrice: 10, category: 'Accessories' },
  { id: '8', description: 'Pinch Hook', defaultPrice: 35, category: 'Accessories' },
  { id: '9', description: 'Curtain Hook', defaultPrice: 30, category: 'Accessories' },
  { id: '10', description: 'Sewing', defaultPrice: 20, category: 'Workmanship' },
  { id: '11', description: 'Blind', defaultPrice: 240, category: 'Blinds' },
  { id: '12', description: 'Tassel', defaultPrice: 50, category: 'Accessories' },
  { id: '13', description: 'Pelmet Box', defaultPrice: 180, category: 'Hardware' },
  { id: '14', description: 'Installation & Fitting', defaultPrice: 150, category: 'Services' },
  { id: '15', description: 'Curtain Repair Work', defaultPrice: 100, category: 'Services' },
];

export const DEFAULT_NOTES = "THANK YOU FOR YOUR BUSINESS!";
