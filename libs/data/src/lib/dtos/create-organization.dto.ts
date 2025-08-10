import { IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateOrganizationDto {
  @IsString()
  @MinLength(3, { message: 'Min 3 characters'})
  name: string | undefined;
  @IsNumber()
  @IsOptional()
  parentId?: number | null;
}
