import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '@task-management/data';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    let loginDto: LoginDto;
    let user: User;

    beforeEach(async () => {
      loginDto = { email: 'test@example.com', password: 'secret' };
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
      } as User;
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      const wrongLogin = { ...loginDto, password: 'wrong' };
      await expect(service.login(wrongLogin)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should return access_token if login is successful', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      jwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        id: user.id,
        name: user.name,
      });
      expect(result).toEqual({
        sub: user.id,
        id: user.id,
        email: user.email,
        name: user.name,
        access_token: 'jwt-token',
      });
    });
  });
});
