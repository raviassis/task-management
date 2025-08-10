import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from '@task-management/data';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}
