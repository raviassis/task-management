import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrganizationUser } from "./entities/organization-user.entity";
import { Repository } from "typeorm";
import { hasPermission } from "../rbac/role";
import { PermissionsEnum } from "../rbac/permission";

@Injectable()
export class OrganizationPermissionService {
  constructor(
    @InjectRepository(OrganizationUser)
    private readonly organizationUserRepositry: Repository<OrganizationUser>
  ) {}

  public async checkOrganizationPermission(
      organizationId: number,
      userId: number,
      permission: PermissionsEnum
    ) {
      const orgUser = await this.organizationUserRepositry.findOne({
        where: { userId, organizationId }
      });
      if (!orgUser || !hasPermission(orgUser.role, permission)) {
        throw new ForbiddenException(`Missing permission: ${permission}`);
      }
    }
}