import { IsEmail, IsString, IsStrongPassword, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;
  @IsEmail()
  email: string;
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  })
  password: string;
}
