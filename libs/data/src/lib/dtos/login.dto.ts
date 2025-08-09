import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please enter a valid email'})
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Min 8 characters'})
  password!: string;
}