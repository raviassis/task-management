import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  Request
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService
  ) {}

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto, @Request() req) {
    return this.organizationsService.create(createOrganizationDto, req.user.sub);
  }

  @Get()
  findAll(@Request() req) {
    return this.organizationsService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.organizationsService.findOne(+id, req.user.sub);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @Request() req,
  ) {
    return this.organizationsService.update(+id, updateOrganizationDto, req.user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Request() req) {
    return this.organizationsService.remove(+id, req.user.sub);
  }

  @Put(':id/members/:memberId')
  memberUpdate(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() updateOrganizationDto: UpdateMemberDto,
    @Request() req,
  ) {
    return this.organizationsService.updateMember(req.user.sub, +id, +memberId, updateOrganizationDto);
  }

  @Delete(':id/members/:memberId')
  memberDelete(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    return this.organizationsService.deleteMember(req.user.sub, +id, +memberId);
  }
}
