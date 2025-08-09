import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationUser } from './entities/organization-user.entity';
import { OrganizationPermissionService } from './organization-permissions.service';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [
        OrganizationsService,
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
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
            })),
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

    controller = module.get<OrganizationsController>(OrganizationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
