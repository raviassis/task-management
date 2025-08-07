import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { Repository } from 'typeorm';
import { Task, TaskStatusEnum } from './entities/task.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

describe('TasksService', () => {
  let service: TasksService;
  let repo: jest.Mocked<Repository<Task>>;

  const taskEntity: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatusEnum.TODO,
    createdAt: new Date(),
    updatedAt: new Date(),
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
      const dto: CreateTaskDto = { title: 'Test Task', description: 'Test Description' };
      repo.save.mockResolvedValue(taskEntity);

      const result = await service.create(dto);

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining(dto));
      expect(result).toEqual(taskEntity);
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      repo.find.mockResolvedValue([taskEntity]);
      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalled();
      expect(result).toEqual([taskEntity]);
    });
  });

  describe('findOne', () => {
    it('should return one task by id', async () => {
      repo.findOneBy.mockResolvedValue(taskEntity);
      const result = await service.findOne(1);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(taskEntity);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the task', async () => {
      const dto: UpdateTaskDto = { title: 'Updated Task' };
      repo.findOneBy.mockResolvedValue(taskEntity);
      repo.save.mockResolvedValue({ ...taskEntity, ...dto });

      const result = await service.update(1, dto);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Updated Task' }));
      expect(result.title).toEqual('Updated Task');
    });
  });

  describe('remove', () => {
    it('should remove the task', async () => {
      repo.findOneBy.mockResolvedValue(taskEntity);
      repo.remove.mockResolvedValue(taskEntity);

      const result = await service.remove(1);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repo.remove).toHaveBeenCalledWith(taskEntity);
      expect(result).toBeUndefined();
    });
  });
});
