import { RoleEnum } from "@task-management/rbac";
import { IsEnum } from "class-validator";

export class UpdateMemberDto {
  @IsEnum(RoleEnum)
  role: RoleEnum;
}