export const PermissionsEnum = {
  TASK_CREATE: 'task:create',
  TASK_EDIT: 'task:edit',
  TASK_DELETE: 'task:delete',
  TASK_VIEW: 'task:view',
  ORGANIZATION_EDIT: 'organization:edit',
  ORGANIZATION_DELETE: 'organization:delete',
  ORGANIZATION_VIEW: 'organization:view',
  ORGANIZATION_INVITE: 'organization:invite',
  ORGANIZATION_USER_ROLES_EDIT: 'organization:user_roles_edit',
  SUB_ORGANIZATION_CREATE: 'sub_organization:create',
} as const;

export type PermissionsEnum = (typeof PermissionsEnum)[keyof typeof PermissionsEnum];