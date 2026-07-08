import { useAuthStore } from "@/store/authStore";

type Permission = {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
};

type PermissionResult = {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  hasAny: boolean;
};

export function usePermissions(module: string): PermissionResult {
  const { role, permissions } = useAuthStore();

  if (role === "super_admin") {
    return {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canExport: true,
      hasAny: true,
    };
  }

  const modulePerms: Permission | undefined = permissions[module];

  const canView = modulePerms?.view ?? false;
  const canCreate = modulePerms?.create ?? false;
  const canEdit = modulePerms?.edit ?? false;
  const canDelete = modulePerms?.delete ?? false;
  const canExport = modulePerms?.export ?? false;

  return {
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    hasAny: canView || canCreate || canEdit || canDelete || canExport,
  };
}