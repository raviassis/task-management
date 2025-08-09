import { PermissionsEnum } from "./permission";
import { hasPermission, RoleEnum } from "./role";


describe('hasPermission', () => {
  it('should return true if Owner has ORGANIZATION_EDIT permission', () => {
    expect(hasPermission(RoleEnum.Owner, PermissionsEnum.ORGANIZATION_EDIT)).toBe(true);
  });

  it('should return false if Admin does not have ORGANIZATION_EDIT permission', () => {
    expect(hasPermission(RoleEnum.Admin, PermissionsEnum.ORGANIZATION_EDIT)).toBe(false);
  });

  it('should return true if Viewer has ORGANIZATION_VIEW permission', () => {
    expect(hasPermission(RoleEnum.Viewer, PermissionsEnum.ORGANIZATION_VIEW)).toBe(true);
  });

  it('should return false if Viewer does not have TASK_DELETE permission', () => {
    expect(hasPermission(RoleEnum.Viewer, PermissionsEnum.TASK_DELETE)).toBe(false);
  });

  it('should return true if Admin has TASK_CREATE permission', () => {
    expect(hasPermission(RoleEnum.Admin, PermissionsEnum.TASK_CREATE)).toBe(true);
  });

  it('should return false if role has no matching permission', () => {
    expect(hasPermission(RoleEnum.Admin, PermissionsEnum.ORGANIZATION_DELETE)).toBe(false);
  });
});
