import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { OrganizationParamDto, TaskOrganizationParamDto } from './dto/organization-params.dto';

@Controller('organizations/:organizationId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Param() params: OrganizationParamDto,
    @Request() req, 
    @Body() createTaskDto: CreateTaskDto
  ): Promise<Task> {
    return this.tasksService.create(+req.user.sub, params.organizationId, createTaskDto);
  }

  @Get()
  findAll(
    @Param() params: OrganizationParamDto,
    @Request() req,
  ): Promise<Task[]> {
    return this.tasksService.findAll(+req.user.sub, params.organizationId);
  }

  @Get(':id')
  findOne(
    @Param() params: TaskOrganizationParamDto,
    @Request() req,
  ): Promise<Task> {
    return this.tasksService.findOne(+req.user.sub, params.organizationId, params.id);
  }

  @Put(':id')
  update(
    @Param() params: TaskOrganizationParamDto,
    @Request() req,
    @Body() updateTaskDto: UpdateTaskDto
  ) {
    return this.tasksService.update(+req.user.sub, params.organizationId, params.id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param() params: TaskOrganizationParamDto,
    @Request() req,
  ) {
    return this.tasksService.remove(+req.user.sub, params.organizationId, params.id);
  }
}
