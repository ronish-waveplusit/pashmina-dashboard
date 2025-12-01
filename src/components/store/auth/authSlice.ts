// src/store/authSlice.ts
import { UserRole } from "../../../constants/user-roles";
import { UpdateUserPayload } from "../../../types/user-management";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define types for the backend response
interface User {
  id: number;
  name: string;
  email: string;
  branch: string | null;
  branch_id: string | null;
  branch_type: string | null;
  groups: UserRole[]; // Maps to user roles
}

interface LoginResponse {
  user: User;
  groups: UserRole[]; // Maps to user roles
  permissions: string[]; // Permissions can be derived from groups or another source
  accessToken: string;
  refreshToken: string;
  refreshTokenExp: number;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  userRoles: UserRole[]; // Replaces groups
  userPermissions: string[]; // Permissions can be derived from groups or another source
  accessToken: string | null;
  refreshToken: string | null;
  refreshTokenExpiry: number | null;
  isChecking: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  userRoles: [],
  userPermissions: [],
  accessToken: null,
  refreshToken: null,
  refreshTokenExpiry: null,
  isChecking: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<LoginResponse>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.userRoles = action.payload.groups;
      state.userPermissions = action.payload.permissions; // Map groups to permissions (customize as needed)
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.refreshTokenExpiry = action.payload.refreshTokenExp;
    },
    updateUser(state, action: PayloadAction<UpdateUserPayload>) {
      if (state.user) {
        state.user = {
          ...state.user, // Preserve existing fields (e.g., groups)
          ...action.payload, // Update with new data
          groups: action.payload.groups || state.user.groups, // Fallback to existing groups
        };
        state.userRoles = action.payload.groups || state.userRoles; // Update roles if provided
        state.userPermissions = action.payload.groups || state.userPermissions; // Update permissions if needed
      }
    },
    setChecking(state, action: PayloadAction<boolean>) {
      state.isChecking = action.payload;
    },
    logout() {
      return initialState; // Reset to initial state
    },
    replaceState(state, action: PayloadAction<AuthState>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { loginSuccess, updateUser, setChecking, logout, replaceState } =
  authSlice.actions;
export default authSlice.reducer;
