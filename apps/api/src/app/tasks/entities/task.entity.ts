import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";

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

  // constructor({
  //   title,
  //   description,
  // }: {
  //   title: string,
  //   description: string
  // }) {
  //   super();
  //   this.title = title;
  //   this.description = description;
  // }
}
