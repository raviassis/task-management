import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { TaskStatusEnum } from '@task-management/data';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsEnum(TaskStatusEnum)
  status?: TaskStatusEnum | null
}
