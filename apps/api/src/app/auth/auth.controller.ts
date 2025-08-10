import { Controller, Post, Body, Get, Request, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '@task-management/data';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { Public } from './auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto, 
    @Res({ passthrough: true }) res: Response
  ) {
    const user = await this.authService.login(loginDto);
    // TODO: Set up HTTPS on both backend and frontend to allow secure cookie-based authentication 
    // in production.
    // ref: https://medium.com/kanlanc/heres-why-storing-jwt-in-local-storage-is-a-great-mistake-df01dad90f9e
    res.cookie('access_token', user.access_token, { 
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 1000 * 60 * 15,
    });
    return user;
  }

  @Public()
  @Post('register')
  register(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(createUserDto);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
