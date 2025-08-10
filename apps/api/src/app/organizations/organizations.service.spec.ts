import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrganizationUser } from './entities/organization-user.entity';
import { OrganizationPermissionService } from './organization-permissions.service';
import { RoleEnum } from '@task-management/rbac';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let repo: jest.Mocked<Repository<Organization>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockQueryBuilder: any;

  beforeEach(async () => {
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      subQuery: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      getQuery: jest.fn().mockReturnValue('subquery'),
      getOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(OrganizationUser),
          useValue: {
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: OrganizationPermissionService,
          useValue: {
            checkOrganizationPermission: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
    repo = module.get(getRepositoryToken(Organization));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create org with owner member and no parent', async () => {
      const dto = { name: 'Org1' };
      const userId = 1;
      repo.save.mockImplementation(async (org) => org as Organization);

      const org = await service.create(dto, userId);

      expect(org.name).toBe(dto.name);
      expect(org.members).toHaveLength(1);
      expect(org.members[0]).toBeInstanceOf(OrganizationUser);
      expect(org.members[0].userId).toBe(userId);
      expect(org.members[0].role).toBe(RoleEnum.Owner);
      expect(repo.save).toHaveBeenCalledWith(org);
    });

    it('should set parent organization when parentId provided', async () => {
      const dto = { name: 'Org2', parentId: 10 };
      const userId = 1;

      const parentOrg = {
        id: 10,
        isSubOrganization: () => false,
        members: [{ userId: 1, role: RoleEnum.Owner }],
        subOrganizations: [],
      } as Organization;

      mockQueryBuilder.getOne.mockResolvedValue(parentOrg);

      repo.save.mockImplementation(async (org) => org as Organization);

      const org = await service.create(dto, userId);

      expect(org.parent).toBe(parentOrg);
      expect(repo.save).toHaveBeenCalledWith(org);
    });

    it('should throw error if trying to set self as parent', async () => {
      const dto = { name: 'Org2', parentId: 10 };
      const orgId = 10;

      const org = {
        id: 10,
        isSubOrganization: () => false,
        members: [{ userId: 1, role: RoleEnum.Owner }],
        subOrganizations: [],
      } as Organization;

      mockQueryBuilder.getOne.mockResolvedValue(org);

      repo.save.mockImplementation(async (org) => org as Organization);

      expect(repo.save).not.toHaveBeenCalled();
      await expect(service.update(orgId, dto, 1)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw error if parent is a sub-organization', async () => {
      const parentOrg = {
        id: 2,
        isSubOrganization: () => true,
        members: [{ userId: 1, role: RoleEnum.Owner }],
      } as Organization;

      mockQueryBuilder.getOne.mockResolvedValue(parentOrg);

      const org = new Organization();
      org.id = 3;
      org.subOrganizations = [];

      await expect(service['setParentOrganization'](2, org, 1)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('findAll', () => {
    it('should list organizations', async () => {
      const orgs = [
        {
          name: 'org1',
        },
        {
          name: 'org2',
        },
      ] as Organization[];
      repo.find.mockResolvedValue(orgs);

      const result = await service.findAll(1);

      expect(repo.find).toHaveBeenCalledWith({
        where: {
          parent: expect.anything(),
          members: expect.objectContaining({
            userId: 1,
            role: expect.anything(),
          }),
        },
      });
      expect(result).toEqual(orgs);
    });
  });

  describe('findOne', () => {
    it('should return org if found', async () => {
      const org = {
        id: 1,
        name: 'Org1',
        members: [{ userId: 1, role: RoleEnum.Owner }],
      } as Organization;
      mockQueryBuilder.getOne.mockResolvedValue(org);

      const result = await service.findOne(1, 1);

      expect(repo.createQueryBuilder).toHaveBeenCalled();
      expect(result).toBe(org);
    });

    it('should throw NotFoundException if org not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update name and save', async () => {
      const org = new Organization();
      org.id = 1;
      org.name = 'OldName';
      org.members = [{ userId: 1, role: RoleEnum.Owner }] as OrganizationUser[];

      mockQueryBuilder.getOne.mockResolvedValue(org);
      repo.save.mockImplementation(async (o) => o as Organization);

      const updateDto = { name: 'NewName' };
      const result = await service.update(1, updateDto, 1);

      expect(result.name).toBe('NewName');
      expect(repo.save).toHaveBeenCalledWith(org);
    });

    it('should set parent to null when parentId is null', async () => {
      const org = new Organization();
      org.id = 1;
      org.parent = { id: 10 } as Organization;
      org.members = [{ userId: 1, role: RoleEnum.Owner }] as OrganizationUser[];

      mockQueryBuilder.getOne.mockResolvedValue(org);

      repo.save.mockImplementation(async (o) => o as Organization);

      const updateDto = { parentId: null };
      const result = await service.update(1, updateDto, 1);

      expect(result.parent).toBeNull();
      expect(repo.save).toHaveBeenCalledWith(org);
    });

    it('should set new parent when parentId provided', async () => {
      const org = new Organization();
      org.id = 1;
      org.members = [{ userId: 1, role: RoleEnum.Owner }] as OrganizationUser[];
      org.subOrganizations = [];

      const newParent = new Organization();
      newParent.id = 20;
      newParent.members = [
        { userId: 1, role: RoleEnum.Owner },
      ] as OrganizationUser[];
      newParent.subOrganizations = [];

      mockQueryBuilder.getOne
        .mockResolvedValueOnce(org)
        .mockResolvedValue(newParent);
      repo.save.mockImplementation(async (o) => o as Organization);

      const updateDto = { parentId: 20 };
      const result = await service.update(1, updateDto, 1);

      expect(result.parent).toBe(newParent);
      expect(repo.save).toHaveBeenCalledWith(org);
    });
  });

  describe('remove', () => {
    it('should find and remove organization', async () => {
      const org = new Organization();
      org.members = [{ userId: 1, role: RoleEnum.Owner }] as OrganizationUser[];

      mockQueryBuilder.getOne.mockResolvedValue(org);
      repo.remove.mockResolvedValue(undefined);

      await service.remove(1, 1);

      expect(repo.remove).toHaveBeenCalledWith(org);
    });
  });
});
