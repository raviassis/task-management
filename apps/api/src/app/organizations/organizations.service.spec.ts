import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrganizationUser } from './entities/organization-user.entity';
import { RoleEnum } from '../rbac/role';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let repo: jest.Mocked<Repository<Organization>>;

  beforeEach(async () => {
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
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
    repo = module.get(getRepositoryToken(Organization));
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

      const parentOrg = { id: 10, isSubOrganization: () => false } as Organization;

      repo.findOne
        .mockResolvedValue(parentOrg);

      repo.save.mockImplementation(async (org) => org as Organization);

      const org = await service.create(dto, userId);

      expect(org.parent).toBe(parentOrg);
      expect(repo.save).toHaveBeenCalledWith(org);
    });

    it('should throw error if trying to set self as parent', async () => {
      const dto = { name: 'Org2', parentId: 10 };
      const orgId = 10;

      const parentOrg = { id: 10, isSubOrganization: () => false } as Organization;

      repo.findOne
        .mockResolvedValue(parentOrg);

      repo.save.mockImplementation(async (org) => org as Organization);

      expect(repo.save).not.toHaveBeenCalled();
      await expect(service.update(orgId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw error if parent is a sub-organization', async () => {
      const parentOrg = {
        id: 2,
        isSubOrganization: () => true,
      } as Organization;

      repo.findOne
        .mockResolvedValue(parentOrg);

      const org = new Organization();
      org.id = 3;

      await expect(service['setParentOrganization'](2, org)).rejects.toThrow(BadRequestException);
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
        }
      ] as Organization[];
      repo.find.mockResolvedValue(orgs);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({
        where: { parent: expect.anything() },
      });
      expect(result).toEqual(orgs);
    });
  });

  describe('findOne', () => {
    it('should return org if found', async () => {
      const org = { id: 1, name: 'Org1' } as Organization;
      repo.findOne.mockResolvedValue(org);

      const result = await service.findOne(1);

      expect(repo.findOne).toHaveBeenCalled();
      expect(result).toBe(org);
    });

    it('should throw NotFoundException if org not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update name and save', async () => {
      const org = new Organization();
      org.id = 1;
      org.name = 'OldName';

      repo.findOne
        .mockResolvedValue(org);
      repo.save.mockImplementation(async (o) => o as Organization);

      const updateDto = { name: 'NewName' };
      const result = await service.update(1, updateDto);

      expect(result.name).toBe('NewName');
      expect(repo.save).toHaveBeenCalledWith(org);
    });

    it('should set parent to null when parentId is null', async () => {
      const org = new Organization();
      org.id = 1;
      org.parent = { id: 10 } as Organization;

      repo.findOne
        .mockResolvedValue(org);
      
      repo.save.mockImplementation(async (o) => o as Organization);

      const updateDto = { parentId: null };
      const result = await service.update(1, updateDto);

      expect(result.parent).toBeNull();
      expect(repo.save).toHaveBeenCalledWith(org);
    });

    it('should set new parent when parentId provided', async () => {
      const org = new Organization();
      org.id = 1;
      
      const newParent = new Organization();
      newParent.id = 20;

      repo.findOne
        .mockResolvedValueOnce(org)
        .mockResolvedValue(newParent);
      repo.save.mockImplementation(async (o) => o as Organization);

      const updateDto = { parentId: 20 };
      const result = await service.update(1, updateDto);

      expect(result.parent).toBe(newParent);
      expect(repo.save).toHaveBeenCalledWith(org);
    });
  });

  describe('remove', () => {
    it('should find and remove organization', async () => {
      const org = new Organization();

      repo.findOne
        .mockResolvedValueOnce(org);
      repo.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repo.remove).toHaveBeenCalledWith(org);
    });
  });
});
