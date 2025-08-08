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

      // Mock findOne to return a parent org without sub-organization parent
      const parentOrg = { id: 10, isSubOrganization: () => false };
      jest.spyOn(service, 'findOne').mockResolvedValue(parentOrg as any);
      repo.save.mockImplementation(async (org) => org as Organization);

      const org = await service.create(dto, userId);

      expect(service.findOne).toHaveBeenCalledWith(dto.parentId);
      expect(org.parent).toBe(parentOrg);
      expect(repo.save).toHaveBeenCalledWith(org);
    });

    it('should throw error if trying to set self as parent', async () => {
      const dto = { name: 'Org3', parentId: 1 };
      const userId = 1;

      // Create organization with id 1
      const org = new Organization();
      org.id = 1;
      repo.save.mockResolvedValue(org);

      // Override findOne to return org with id=1
      jest.spyOn(service, 'findOne').mockResolvedValue(org);

      // Call setParentOrganization directly to test error
      await expect(service['setParentOrganization'](1, org)).rejects.toThrow(BadRequestException);
    });

    it('should throw error if parent is a sub-organization', async () => {
      const dto = { name: 'Org4', parentId: 2 };
      const userId = 1;

      const parentOrg = {
        id: 2,
        isSubOrganization: () => true,
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(parentOrg as any);

      const org = new Organization();
      org.id = 3;

      await expect(service['setParentOrganization'](2, org)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should call find with IsNull parent', async () => {
      repo.find.mockResolvedValue(['org1', 'org2'] as any);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({
        where: { parent: expect.anything() }, // IsNull is a function, can't check directly here
      });
      expect(result).toEqual(['org1', 'org2']);
    });
  });

  describe('findOne', () => {
    it('should return org if found', async () => {
      const org = { id: 1, name: 'Org1' };
      repo.findOne.mockResolvedValue(org as any);

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
      org.parent = null;
      jest.spyOn(service, 'findOne').mockResolvedValue(org);
      repo.save.mockImplementation(async (o) => o as Organization);

      const updateDto = { name: 'NewName' };
      const result = await service.update(1, updateDto);

      expect(result.name).toBe('NewName');
      expect(repo.save).toHaveBeenCalledWith(org);
    });

    it('should set parent to null when parentId is null', async () => {
      const org = new Organization();
      org.id = 1;
      org.parent = { id: 10 } as any;
      jest.spyOn(service, 'findOne').mockResolvedValue(org);
      repo.save.mockImplementation(async (o) => o as Organization);

      const updateDto = { parentId: null };
      const result = await service.update(1, updateDto);

      expect(result.parent).toBeNull();
      expect(repo.save).toHaveBeenCalledWith(org);
    });

    it('should set new parent when parentId provided', async () => {
      const org = new Organization();
      org.id = 1;
      org.parent = null;
      jest.spyOn(service, 'findOne').mockResolvedValue(org);

      const newParent = { id: 20, isSubOrganization: () => false };
      jest.spyOn(service, 'findOne').mockImplementation((id: number) => {
        if (id === 20) return Promise.resolve(newParent as any);
        return Promise.resolve(org);
      });
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
      jest.spyOn(service, 'findOne').mockResolvedValue(org);
      repo.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repo.remove).toHaveBeenCalledWith(org);
    });
  });
});
