import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { OrganizationUser } from "../../organizations/entities/organization-user.entity";

@Entity()
export class User extends BaseEntity {
  @Column()
  name: string;
  @Column({ unique: true })
  email: string;
  @Column()
  password: string;

  @OneToMany(() => OrganizationUser, orgUser => orgUser.user, { cascade: true })
  organizations: OrganizationUser[];
}
