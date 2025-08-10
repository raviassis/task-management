import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationPermissionService } from '../organizations/organization-permissions.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { PermissionsEnum } from '@task-management/rbac';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly permissionService: OrganizationPermissionService,
    private readonly organizationService: OrganizationsService,
  ) {}

  async create(userId: number, organizationId: number, createTaskDto: CreateTaskDto): Promise<Task> {
    const org = await this.organizationService.findOne(organizationId, userId);
    await this.permissionService.checkOrganizationPermission(org.id, userId, PermissionsEnum.TASK_CREATE);
    const task = new Task();
    task.title = createTaskDto.title;
    task.description = createTaskDto.description;
    task.organization = org;
    return this.taskRepository.save(task)
  }

  async findAll(userId: number, organizationId: number): Promise<Task[]> {
    const org = await this.organizationService.findOne(organizationId, userId);
    await this.permissionService.checkOrganizationPermission(
      org.id, userId, PermissionsEnum.TASK_VIEW
    );
    return this.taskRepository.find({
      where: {
        organization: {
          id: organizationId,
        },
      },
    });
  }

  async findOne(userId: number, organizationId: number, id: number): Promise<Task> {
    const org = await this.organizationService.findOne(organizationId, userId);
    await this.permissionService.checkOrganizationPermission(
      org.id, userId, PermissionsEnum.TASK_VIEW
    );
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task id ${id} not found`);
    }
    return task;
  }

  async update(userId: number, organizationId: number, id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(userId, organizationId, id);
    await this.permissionService.checkOrganizationPermission(
      organizationId, userId, PermissionsEnum.TASK_EDIT
    );
    if (updateTaskDto.status) task.status = updateTaskDto.status;
    if (updateTaskDto.title != null) task.title = updateTaskDto.title;
    if (updateTaskDto.description != null) task.description = updateTaskDto.description;
    return this.taskRepository.save(task);
  }

  async remove(userId: number, organizationId: number, id: number): Promise<void> {
    const task = await this.findOne(userId, organizationId, id);
    await this.permissionService.checkOrganizationPermission(
      organizationId, userId, PermissionsEnum.TASK_DELETE
    );
    await this.taskRepository.remove(task);
  }
}
