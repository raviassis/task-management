import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { Organization } from "../../organizations/entities/organization.entity";

export const TaskStatusEnum =  {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
} as const;

export type TaskStatusEnum = (typeof TaskStatusEnum)[keyof typeof TaskStatusEnum];

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
