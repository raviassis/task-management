import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>
  ) {}

  private mapUserToUserDto(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.name;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const alreadyExists = await this.userRepository.existsBy({ email: createUserDto.email });
    if (alreadyExists) {
      throw new ConflictException('Email already exists');
    }
    const user = new User();
    user.name = createUserDto.name;
    user.email = createUserDto.email;
    user.password = await bcrypt.hash(createUserDto.password, 10);
    return this.userRepository.save(user).then(this.mapUserToUserDto);
  }

  findAll(): Promise<UserDto[]> {
    return this.userRepository.find().then(users => users.map(this.mapUserToUserDto));
  }

  async findOne(id: number): Promise<UserDto> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User id ${id} not found`);
    }
    return this.mapUserToUserDto(user);
  }
}
