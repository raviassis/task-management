import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class OrganizationParamDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationId: number;
}

export class TaskOrganizationParamDto extends PartialType(OrganizationParamDto) {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}