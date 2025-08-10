import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '@task-management/data';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            existsBy: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a user if email does not exist', async () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret',
      };
      repo.existsBy.mockResolvedValue(false);
      const savedUser = { id: 1, ...dto, password: 'hashed', createdAt: new Date(), updatedAt: new Date() } as User;
      repo.save.mockResolvedValue(savedUser);

      const result = await service.create(dto);

      expect(repo.existsBy).toHaveBeenCalledWith({ email: dto.email });
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ name: dto.name, email: dto.email }));
      expect(result).toEqual(expect.objectContaining({ id: savedUser.id, email: savedUser.email }));
    });

    it('should throw ConflictException if email already exists', async () => {
      const dto: CreateUserDto = { name: 'John', email: 'john@example.com', password: 'secret' };
      repo.existsBy.mockResolvedValue(true);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users: User[] = [
        { id: 1, email: 'a@test.com', name: 'A', password: 'hashed', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, email: 'b@test.com', name: 'B', password: 'hashed', createdAt: new Date(), updatedAt: new Date() },
      ] as User[];

      repo.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserDto);
    });
  });

  describe('findOne', () => {
    it('should return user if found', async () => {
      const user: User = { id: 1, email: 'test@test.com', name: 'Test', password: 'hashed', createdAt: new Date(), updatedAt: new Date() } as User;
      repo.findOneBy.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBeInstanceOf(UserDto);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(123)).rejects.toThrow(NotFoundException);
    });
  });
});

