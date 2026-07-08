// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Permission = {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;  // ✅ add this
};

type PermissionsMap = {
  [module: string]: Permission;
};

type AuthState = {
  role: string;
  token: string;
  refreshToken: string;
  permissions: PermissionsMap;

  login: (token: string, refreshToken: string, role: string, permissions: PermissionsMap) => void;
  setRole: (role: string) => void;
  setPermissions: (permissions: PermissionsMap) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: "",
      token: "",
      refreshToken: "",
      permissions: {},

      // ✅ login function is back — now also accepts permissions
      login: (token, refreshToken, role, permissions) =>
        set({ token, refreshToken, role, permissions }),

      setRole: (role) => set({ role }),
      setPermissions: (permissions) => set({ permissions }),
      clearAuth: () =>
        set({ role: "", token: "", refreshToken: "", permissions: {} }),
    }),
    { name: "auth-storage" }
  )
);