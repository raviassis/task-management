import { Entity, Column, ManyToOne, OneToMany, } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { OrganizationUser } from "./organization-user.entity";

@Entity("organizations")
export class Organization extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => Organization, { nullable: true, onDelete: 'CASCADE' })
  parent: Organization;

  @OneToMany(() => Organization, subOrg => subOrg.parent)
  subOrganizations: Organization[];

  @OneToMany(() => OrganizationUser, orgUser => orgUser.organization, { cascade: true, onDelete: 'CASCADE' })
  members: OrganizationUser[];

  public isSubOrganization(): boolean {
    return this.parent != null;
  }
}

