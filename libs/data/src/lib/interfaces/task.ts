export const TaskStatusEnum =  {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
} as const;

export type TaskStatusEnum = (typeof TaskStatusEnum)[keyof typeof TaskStatusEnum];

export interface Task {
  id: number;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  status: TaskStatusEnum;
}