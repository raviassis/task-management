import { IsEnum } from "class-validator";
import { RoleEnum } from "../../rbac/role";

export class UpdateMemberDto {
  @IsEnum(RoleEnum)
  role: RoleEnum;
}