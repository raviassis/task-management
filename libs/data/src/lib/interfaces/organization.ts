import { UserProfile } from "./auth";

export interface Organization {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  subOrganizations: Omit<Organization, 'subOrganizations'>[];
  members: {
      userId: number,
      organizationId: number,
      role: string,
      user: UserProfile,
  }[];
}