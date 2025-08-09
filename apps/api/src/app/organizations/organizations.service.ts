import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { In, IsNull, Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationUser } from './entities/organization-user.entity';
import { hasPermission, RoleEnum } from '../rbac/role';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionsEnum } from '../rbac/permission';
import { UpdateMemberDto } from './dto/update-member.dto';
import { OrganizationPermissionService } from './organization-permissions.service';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationUser)
    private readonly organizationUserRepositry: Repository<OrganizationUser>,
    private readonly permissionService: OrganizationPermissionService,
  ) {}
  async create(
    createOrganizationDto: CreateOrganizationDto,
    userId: number
  ): Promise<Organization> {
    const orgUser = new OrganizationUser();
    orgUser.userId = userId;
    orgUser.role = RoleEnum.Owner;

    const org = new Organization();
    org.name = createOrganizationDto.name;
    org.members = [orgUser];
    org.subOrganizations = [];

    if (createOrganizationDto.parentId != null) {
      await this.setParentOrganization(
        createOrganizationDto.parentId,
        org,
        userId
      );
    }
    return this.organizationRepository.save(org);
  }

  private async setParentOrganization(
    parentId: number,
    org: Organization,
    userId: number
  ) {
    if (org.id === parentId)
      throw new BadRequestException(
        'An organization cannot be parent of itself.'
      );
    const parentOrg = await this.findOne(parentId, userId);
    await this.permissionService.checkOrganizationPermission(
      parentOrg.id, userId, PermissionsEnum.SUB_ORGANIZATION_CREATE
    );
    if (parentOrg.isSubOrganization() || org.subOrganizations.length > 0)
      throw new BadRequestException(
        'Cannot create a sub-organization within another sub-organization'
      );
    org.parent = parentOrg;
  }

  findAll(userId: number) {
    return this.organizationRepository.find({
      where: {
        parent: IsNull(),
        members: {
          userId,
          role: In([RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Viewer]),
        },
      },
    });
  }

  async findOne(id: number, userId: number) {
    const org = await this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.parent', 'parent')
      .leftJoinAndSelect('organization.members', 'member')
      .leftJoin('member.user', 'user')
      .addSelect([
        'user.id',
        'user.name',
        'user.email',
        'user.createdAt',
        'user.updatedAt',
      ])
      .leftJoinAndSelect('organization.subOrganizations', 'subOrg')
      .where('organization.id = :id', { id })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('ou.organizationId')
          .from('organization_users', 'ou')
          .where('ou.organizationId = :id')
          .andWhere('ou.userId = :userId')
          .getQuery();
        return 'organization.id IN ' + subQuery;
      })
      .setParameters({ id, userId })
      .getOne();
    if (!org) throw new NotFoundException(`Organization id ${id} not found`);
    await this.permissionService.checkOrganizationPermission(
      org.id, userId, PermissionsEnum.ORGANIZATION_VIEW
    );
    return org;
  }

  private checkOrganizationPermission(
    org: Organization,
    userId: number,
    permission: PermissionsEnum
  ) {
    const member = org.members.find((m) => m.userId === userId);
    if (!member || !hasPermission(member.role, permission)) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }
  }

  async update(
    id: number,
    updateOrganizationDto: UpdateOrganizationDto,
    userId: number
  ) {
    const org = await this.findOne(id, userId);
    await this.permissionService.checkOrganizationPermission(
      org.id, userId, PermissionsEnum.ORGANIZATION_EDIT
    );
    if (updateOrganizationDto.name != null)
      org.name = updateOrganizationDto.name;
    if ('parentId' in updateOrganizationDto) {
      if (updateOrganizationDto.parentId === null) {
        org.parent = null;
      } else {
        await this.setParentOrganization(
          updateOrganizationDto.parentId,
          org,
          userId
        );
      }
    }
    return this.organizationRepository.save(org);
  }

  async remove(id: number, userId: number) {
    const org = await this.findOne(id, userId);
    await this.permissionService.checkOrganizationPermission(
      org.id, userId, PermissionsEnum.ORGANIZATION_DELETE
    );
    await this.organizationRepository.remove(org);
  }

  async updateMember(
    userId: number,
    id: number,
    memberId: number,
    updateOrganizationDto: UpdateMemberDto
  ) {
    const org = await this.findOne(id, userId);
    await this.permissionService.checkOrganizationPermission(
      org.id, userId, PermissionsEnum.ORGANIZATION_INVITE
    );
    let member = org.members.find((m) => m.userId === memberId);

    if (!member) {
      member = new OrganizationUser();
      member.userId = memberId;
      member.role = updateOrganizationDto.role;
      org.members.push(member);
    } else {
      member.role = updateOrganizationDto.role;
    }
    await this.organizationRepository.save(org);
  }

  async deleteMember(userId: number, id: number, memberId: number) {
    const org = await this.findOne(id, userId);
    await this.permissionService.checkOrganizationPermission(
      org.id, userId, PermissionsEnum.ORGANIZATION_INVITE
    );
    const member = org.members.find((m) => m.userId === memberId);
    if (
      !org.members.some(
        (m) => m.userId !== memberId && m.role === RoleEnum.Owner
      )
    )
      throw new BadRequestException('Organization needs at least one owner.');
    await this.organizationUserRepositry.remove(member);
  }
}
