import { IsEmail, IsString, IsStrongPassword, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'Min 3 characters'})
  name!: string;
  @IsEmail({}, { message: 'Please enter a valid email'})
  email!: string;
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  }, {
    message: 'Not strong enough',
  })
  password!: string;
}
