import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test description',
    status: 'todo',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const tasksArray: Task[] = [mockTask];

  const mockTasksService = {
    create: jest.fn().mockResolvedValue(mockTask),
    findAll: jest.fn().mockResolvedValue(tasksArray),
    findOne: jest.fn().mockResolvedValue(mockTask),
    update: jest.fn().mockResolvedValue({ ...mockTask, title: 'Updated' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const dto: CreateTaskDto = { title: 'Test Task', description: 'Test' };
      await expect(controller.create(dto)).resolves.toEqual(mockTask);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      await expect(controller.findAll()).resolves.toEqual(tasksArray);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      await expect(controller.findOne('1')).resolves.toEqual(mockTask);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update and return the task', async () => {
      const dto: UpdateTaskDto = { title: 'Updated' };
      await expect(controller.update('1', dto)).resolves.toEqual({
        ...mockTask,
        title: 'Updated',
      });
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove the task and return void', async () => {
      await expect(controller.remove('1')).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
