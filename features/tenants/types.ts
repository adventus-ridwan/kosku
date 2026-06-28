export type Gender = 'MALE' | 'FEMALE';

export type ContractStatus = 'ACTIVE' | 'FINISHED' | 'CANCELLED';

export interface Tenant {
  id: string;
  name: string;
  gender: Gender;
  phone: string;
  occupation: string;
  emergencyContact: string;
  notes: string;
}

export interface Contract {
  id: string;
  roomId: string;
  tenantId: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: ContractStatus;
  notes: string;
}
