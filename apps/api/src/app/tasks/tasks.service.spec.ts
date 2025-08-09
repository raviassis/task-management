import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { Repository } from 'typeorm';
import { Task, TaskStatusEnum } from './entities/task.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { OrganizationPermissionService } from '../organizations/organization-permissions.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { Organization } from '../organizations/entities/organization.entity';

describe('TasksService', () => {
  let service: TasksService;
  let repo: jest.Mocked<Repository<Task>>;

  const organization = new Organization();
  organization.id = 1;
  organization.name = 'Test Org';
  organization.parent = null;
  organization.createdAt = new Date();
  organization.updatedAt = new Date();

  const taskEntity: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatusEnum.TODO,
    organization: organization,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPermissionService = {
    checkOrganizationPermission: jest.fn(),
  };

  const mockOrganizationService = {
    findOne: jest.fn().mockResolvedValue(organization),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: OrganizationPermissionService,
          useValue: mockPermissionService,
        },
        {
          provide: OrganizationsService,
          useValue: mockOrganizationService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repo = module.get(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a task', async () => {
      const dto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
      };

      repo.save.mockResolvedValue(taskEntity);

      const result = await service.create(1, 1, dto);

      expect(mockOrganizationService.findOne).toHaveBeenCalledWith(1, 1);
      expect(
        mockPermissionService.checkOrganizationPermission
      ).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining(dto));
      expect(result).toEqual(taskEntity);
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      repo.find.mockResolvedValue([taskEntity]);

      const result = await service.findAll(1, 1);

      expect(mockOrganizationService.findOne).toHaveBeenCalledWith(1, 1);
      expect(
        mockPermissionService.checkOrganizationPermission
      ).toHaveBeenCalled();
      expect(repo.find).toHaveBeenCalledWith({
        where: {
          organization: {
            id: 1,
          },
        },
      });
      expect(result).toEqual([taskEntity]);
    });
  });

  describe('findOne', () => {
    it('should return one task by id', async () => {
      repo.findOneBy.mockResolvedValue(taskEntity);

      const result = await service.findOne(1, 1, 1);

      expect(mockOrganizationService.findOne).toHaveBeenCalledWith(1, 1);
      expect(
        mockPermissionService.checkOrganizationPermission
      ).toHaveBeenCalled();
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(taskEntity);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(1, 1, 2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the task', async () => {
      const dto: UpdateTaskDto = { title: 'Updated Task' };
      repo.findOneBy.mockResolvedValue(taskEntity);
      repo.save.mockResolvedValue({ ...taskEntity, ...dto });

      const result = await service.update(1, 1, 1, dto);

      expect(mockOrganizationService.findOne).toHaveBeenCalledWith(1, 1);
      expect(
        mockPermissionService.checkOrganizationPermission
      ).toHaveBeenCalled();
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Updated Task' })
      );
      expect(result.title).toEqual('Updated Task');
    });
  });

  describe('remove', () => {
    it('should remove the task', async () => {
      repo.findOneBy.mockResolvedValue(taskEntity);
      repo.remove.mockResolvedValue(taskEntity);

      const result = await service.remove(1, 1, 1);

      expect(mockOrganizationService.findOne).toHaveBeenCalledWith(1, 1);
      expect(
        mockPermissionService.checkOrganizationPermission
      ).toHaveBeenCalled();
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repo.remove).toHaveBeenCalledWith(taskEntity);
      expect(result).toBeUndefined();
    });
  });
});
