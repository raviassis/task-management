export interface Organization {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  subOrganizations: Omit<Organization, 'subOrganizations'>[]
}