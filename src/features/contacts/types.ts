export type ContactKind = 'PERSON' | 'ORGANIZATION';
export type ContactCategory = 'CLIENT' | 'LAWYER' | 'COMPANY' | 'REPRESENTATIVE' | 'EXPERT' | 'WITNESS' | 'JUDICIAL_CONTACT' | 'POLICE' | 'OTHER';
export type ContactChannelType = 'EMAIL' | 'PHONE' | 'WHATSAPP' | 'OTHER';

export interface CatalogOption { value: string; label: string }
export interface Catalogs {
  contactKinds: CatalogOption[];
  contactCategories: CatalogOption[];
  contactChannels: CatalogOption[];
  addressTypes: CatalogOption[];
  [key: string]: CatalogOption[];
}

export interface ContactChannel {
  id: string;
  type: ContactChannelType;
  label: string | null;
  value: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ContactAddress {
  id: string;
  type: 'HOME' | 'WORK' | 'LEGAL' | 'OTHER';
  label: string | null;
  line1: string;
  line2: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string;
  isPrimary: boolean;
}

export interface Contact {
  id: string;
  kind: ContactKind;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  legalName: string | null;
  documentNumber: string | null;
  taxId: string | null;
  notes: string | null;
  version: number;
  categories: ContactCategory[];
  channels: ContactChannel[];
  addresses: ContactAddress[];
  relations: { cases: number; representations: number };
}

export interface ContactInput {
  kind: ContactKind;
  firstName?: string | null;
  lastName?: string | null;
  legalName?: string | null;
  documentNumber?: string | null;
  taxId?: string | null;
  notes?: string | null;
  categories: ContactCategory[];
  channels?: Array<{ type: ContactChannelType; value: string; isPrimary?: boolean }>;
  addresses?: Array<{ type: 'HOME' | 'WORK' | 'LEGAL' | 'OTHER'; line1: string; isPrimary?: boolean }>;
}
