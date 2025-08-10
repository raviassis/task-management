import { IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateOrganizationDto {
  @IsString()
  @MinLength(3)
  name: string;
  @IsNumber()
  @IsOptional()
  parentId?: number | null;
}
