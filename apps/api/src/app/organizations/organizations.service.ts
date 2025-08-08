import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { IsNull, Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationUser } from './entities/organization-user.entity';
import { RoleEnum } from '../rbac/role';
import { InjectRepository } from '@nestjs/typeorm';

const MEMBER_SELECT = {
  userId: true,
  organizationId: true,
  role: true,
  user: {
    id: true,
    createdAt: true,
    updatedAt: true,
    name: true,
    email: true,
  }
};
const ORGANIZATION_SELECT = {
  id: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  parent: true,
  members: MEMBER_SELECT,
}

const SUBORGANIZATION_SELECT = {
  ...ORGANIZATION_SELECT,
  parent: false,
}

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>
  ){}
  async create(createOrganizationDto: CreateOrganizationDto, userId: number): Promise<Organization> {
    const orgUser = new OrganizationUser();
    orgUser.userId = userId;
    orgUser.role = RoleEnum.Owner;

    const org = new Organization();
    org.name = createOrganizationDto.name;
    org.members = [orgUser];

    if (createOrganizationDto.parentId != null) {
      await this.setParentOrganization(createOrganizationDto.parentId, org);
    }
    return this.organizationRepository.save(org);
  }

  private async setParentOrganization(parentId: number, org: Organization) {
    if (org.id === parentId) throw new BadRequestException('An organization cannot be parent of itself.');
    const parentOrg = await this.findOne(parentId);
    if (parentOrg.isSubOrganization())
      throw new BadRequestException('Cannot create a sub-organization within another sub-organization');
    org.parent = parentOrg;
  }

  findAll() {
    return this.organizationRepository.find({ 
      where: {
        parent: IsNull(),
      },
    });
  }

  async findOne(id: number) {
    const findOptions = { 
      where: {
        id
      },
      relations: {
        parent: true,
        members: {
          user: true,
        },
        subOrganizations: true,
      },
      select: {
        ...ORGANIZATION_SELECT,
        subOrganizations: SUBORGANIZATION_SELECT,
      },
    };
    const org = await this.organizationRepository.findOne(findOptions);
    if (!org) throw new NotFoundException(`Organization id ${id} not found`);
    return org;
  }

  async update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    const org = await this.findOne(id);
    if (updateOrganizationDto.name != null) org.name = updateOrganizationDto.name;
    if ('parentId' in updateOrganizationDto) {
      if (updateOrganizationDto.parentId === null) {
        org.parent = null;
      } else {
        await this.setParentOrganization(updateOrganizationDto.parentId, org);
      } 
    }
    return this.organizationRepository.save(org);
  }

  async remove(id: number) {
    const org = await this.findOne(id);
    await this.organizationRepository.remove(org);
  }
}
