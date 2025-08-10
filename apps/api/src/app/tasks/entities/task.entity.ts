import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { Organization } from "../../organizations/entities/organization.entity";
import { TaskStatusEnum } from "@task-management/data";

@Entity()
export class Task extends BaseEntity {
  @Column()
  title: string;
  @Column()
  description: string;
  @Column({ enum: TaskStatusEnum, default: TaskStatusEnum.TODO })
  status: TaskStatusEnum;
  @ManyToOne(() => Organization)
  organization: Organization;
}
