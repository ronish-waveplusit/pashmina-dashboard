import { UserRole } from "../constants/user-roles";

export interface RolePayload {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  pivot?: {
    user_id: string;
    role_id: string;
  };
  permissions: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    pivot: {
      role_id: string;
      permission_id: number;
    };
  }[];
}

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  username: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  my_roles: string[];
  roles: RolePayload[];
  person?: any | null;
  organization: any | null;
}
export interface UpdateUserPayload {
  id: number;
  name: string;
  username: string | null;
  email: string;
  groups?: UserRole[];
}
export interface PermissionPayload {
  id: string;
  name: string;
  created_at: string | null;
  updated_at: string | null;
}
