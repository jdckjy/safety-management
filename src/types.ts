export interface Unit {
  id: string;
  name: string;
  floor: string;
  area_sqm: number;
  status: 'occupied' | 'vacant' | 'under-renovation' | 'notice' | '임대중' | '공실';
  pathData: string;
  position_x: number;
  position_y: number;
}

export interface TenantInfo {
  id: string;
  businessName: string;
  companyName: string;
  contact: string;
  email: string;
  industry: string;
}

export interface Contract {
  id: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rent: number;
  deposit: number;
}

export interface EnrichedUnit extends Unit {
  tenant?: TenantInfo;
  contract?: Contract;
}

export interface RentalHistory {
  id: string;
  year: number;
  rentable_area: number;
  leased_area: number;
  occupancy_rate: number;
  created_at: string;
}
