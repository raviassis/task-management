import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { OrganizationPermissionService } from './organization-permissions.service';
import { OrganizationUser } from './entities/organization-user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleEnum, PermissionsEnum } from '@task-management/rbac';

describe('OrganizationPermissionService', () => {
  let service: OrganizationPermissionService;

  const mockOrgUserRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationPermissionService,
        {
          provide: getRepositoryToken(OrganizationUser),
          useValue: mockOrgUserRepo,
        },
      ],
    }).compile();

    service = module.get<OrganizationPermissionService>(OrganizationPermissionService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should allow permission when user has the permission', async () => {
    const orgUser = { role: RoleEnum.Admin };
    mockOrgUserRepo.findOne.mockResolvedValue(orgUser);

    await expect(
      service.checkOrganizationPermission(1, 2, PermissionsEnum.ORGANIZATION_VIEW),
    ).resolves.toBeUndefined();

    expect(mockOrgUserRepo.findOne).toHaveBeenCalledWith({ where: { userId: 2, organizationId: 1 } });
  });

  it('should throw ForbiddenException if no organization user found', async () => {
    mockOrgUserRepo.findOne.mockResolvedValue(undefined);

    await expect(
      service.checkOrganizationPermission(1, 2, PermissionsEnum.ORGANIZATION_EDIT),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user role lacks permission', async () => {
    const orgUser = { role: 'viewer' };
    mockOrgUserRepo.findOne.mockResolvedValue(orgUser);
    await expect(
      service.checkOrganizationPermission(1, 2, PermissionsEnum.ORGANIZATION_INVITE),
    ).rejects.toThrow(ForbiddenException);
  });
});
