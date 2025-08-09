import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), OrganizationsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
