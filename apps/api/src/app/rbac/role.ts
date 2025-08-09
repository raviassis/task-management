import { PermissionsEnum } from "./permission";

export const RoleEnum = {
  Owner: 'owner',
  Admin: 'admin',
  Viewer: 'viewer',
} as const;

export type RoleEnum = (typeof RoleEnum)[keyof typeof RoleEnum];

export const RolePermissionsMap = {
  [RoleEnum.Owner]: [
    PermissionsEnum.TASK_VIEW, PermissionsEnum.TASK_CREATE, PermissionsEnum.TASK_EDIT, PermissionsEnum.TASK_DELETE,
    PermissionsEnum.ORGANIZATION_VIEW, PermissionsEnum.ORGANIZATION_EDIT,
    PermissionsEnum.ORGANIZATION_DELETE, PermissionsEnum.SUB_ORGANIZATION_CREATE,
    PermissionsEnum.ORGANIZATION_INVITE, PermissionsEnum.ORGANIZATION_USER_ROLES_EDIT
  ],
  [RoleEnum.Admin]: [
    PermissionsEnum.TASK_VIEW, PermissionsEnum.TASK_CREATE, PermissionsEnum.TASK_EDIT, PermissionsEnum.TASK_DELETE,
    PermissionsEnum.ORGANIZATION_VIEW,
  ],
  [RoleEnum.Viewer]: [
    PermissionsEnum.TASK_VIEW, PermissionsEnum.ORGANIZATION_VIEW
  ],
}

export function hasPermission(role: RoleEnum, permission: PermissionsEnum): boolean {
  return RolePermissionsMap[role].some(p => p === permission);
}

