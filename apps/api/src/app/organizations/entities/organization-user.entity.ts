import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { RoleEnum } from "../../rbac/role";
import { User } from "../../users/entities/user.entity";
import { Organization } from "./organization.entity";

@Entity('organization_users')
export class OrganizationUser {
  @PrimaryColumn()
  userId: number;
  @PrimaryColumn()
  organizationId: number;

  @ManyToOne(() => User, (user) => user.organizations, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Organization, (organization) => organization.members, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column({ type: 'text', enum: Object.values(RoleEnum), default: RoleEnum.Viewer })
  role: RoleEnum;
}