"use client";

import { usePermissions } from "@/hooks/usePermissions";

type Props = {
  module: string;
  children: React.ReactNode;
};

export default function PermissionGuard({ module, children }: Props) {
  const { hasAny } = usePermissions(module);  // ✅ use hasAny instead of canView

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-6xl">🔒</p>
        <h2 className="mt-4 text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="mt-2 text-slate-500">
          You don&apos;t have permission to access this module.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}