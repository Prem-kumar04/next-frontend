"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { usePermissions } from "@/hooks/usePermissions";

export default function DashboardPage() {

  const { logout } = useAuth();

  const role = useAuthStore((state) => state.role);

  const users    = usePermissions("Users");
  const reports  = usePermissions("Reports");
  const roles    = usePermissions("Roles");
  const settings = usePermissions("Settings");

  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    total_roles: 0,
    total_reports: 0,
    total_tasks: 0,
  });

  const [loading, setLoading] = useState(true);

  const getToken = () => {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="));

  return cookie ? cookie.split("=")[1] : "";
};

const fetchDashboard = useCallback(async () => {
  try {
    const token = getToken();

    const response = await fetch(
      "http://127.0.0.1:8000/api/dashboard/stats",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    setStats(data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchDashboard();
}, [fetchDashboard]);
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex md:flex-col w-64 bg-slate-900 p-6 text-white">
        <h2 className="mb-10 text-2xl font-bold">RBAC System</h2>

        <nav className="flex flex-col space-y-2 flex-1">

          <Link
            href="/dashboard"
            className="block rounded-lg px-4 py-3 bg-slate-700 font-semibold"
          >
            🏠 Dashboard
          </Link>

          {users.hasAny && (
            <Link
              href="/users"
              className="block rounded-lg px-4 py-3 hover:bg-slate-800"
            >
              👥 Users
            </Link>
          )}

          {roles.hasAny && (
            <Link
              href="/roles"
              className="block rounded-lg px-4 py-3 hover:bg-slate-800"
            >
              🔐 Roles
            </Link>
          )}

          {reports.hasAny && (
            <Link
              href="/reports"
              className="block rounded-lg px-4 py-3 hover:bg-slate-800"
            >
              📊 Reports
            </Link>
          )}

          {settings.hasAny && (
            <Link
              href="/settings"
              className="block rounded-lg px-4 py-3 hover:bg-slate-800"
            >
              ⚙️ Settings
            </Link>
          )}

          <Link
            href="/profile"
            className="block rounded-lg px-4 py-3 hover:bg-slate-800"
          >
            👤 Profile
          </Link>

        </nav>

        <button
          onClick={logout}
          className="mt-6 w-full rounded-lg bg-red-600 px-4 py-3 text-left font-semibold hover:bg-red-700"
        >
          🚪 Logout
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1">

        {/* Header — no duplicate Profile/Logout buttons */}
        <header className="border-b bg-white px-8 py-5">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-500">
  Welcome Back 👋{" "}
  <span className="font-semibold capitalize text-blue-600">
    {role.replace("_", " ")}
  </span>
</p>
        </header>

        <section className="p-8 space-y-8">

          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

            {users.hasAny && (
              <div className="rounded-2xl bg-white p-5 shadow-md">
                <p className="text-center text-slate-500">Total Users</p>
                <h1 className="text-center text-6xl font-bold text-slate-800">
                  {stats.total_users}
                </h1>
              </div>
            )}

            {users.hasAny && (
              <div className="rounded-2xl bg-white p-5 shadow-md">
                <p className="text-center text-slate-500">Active Users</p>
                <h1 className="text-center text-6xl font-bold text-orange-500">
                  {stats.active_users}
                </h1>
              </div>
            )}

            {reports.hasAny && (
              <div className="rounded-2xl bg-white p-5 shadow-md">
                <p className="text-center text-slate-500">Total Reports</p>
                <h1 className="text-center text-6xl font-bold text-blue-500">
                  {stats.total_reports}
                </h1>
              </div>
            )}

            {roles.hasAny && (
              <div className="rounded-2xl bg-white p-5 shadow-md">
                <p className="text-center text-slate-500">Total Roles</p>
                <h1 className="text-center text-6xl font-bold text-purple-500">
                  {stats.total_roles}
                </h1>
              </div>
            )}

          </div>

          {/* ── Quick Access Cards ── */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-slate-700">
              Your Access
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {users.hasAny && (
                <div className="rounded-2xl bg-white p-6 shadow-md border-l-4 border-slate-600">
                  <h3 className="text-lg font-bold">👥 Users</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {users.canView   && <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">View</span>}
                    {users.canCreate && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">Create</span>}
                    {users.canEdit   && <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">Edit</span>}
                    {users.canDelete && <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">Delete</span>}
                  </div>
                </div>
              )}

              {reports.hasAny && (
                <div className="rounded-2xl bg-white p-6 shadow-md border-l-4 border-blue-500">
                  <h3 className="text-lg font-bold">📊 Reports</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {reports.canView   && <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">View</span>}
                    {reports.canCreate && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">Create</span>}
                    {reports.canEdit   && <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">Edit</span>}
                    {reports.canDelete && <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">Delete</span>}
                  </div>
                </div>
              )}

              {roles.hasAny && (
                <div className="rounded-2xl bg-white p-6 shadow-md border-l-4 border-purple-500">
                  <h3 className="text-lg font-bold">🔐 Roles</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {roles.canView   && <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">View</span>}
                    {roles.canCreate && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">Create</span>}
                    {roles.canEdit   && <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">Edit</span>}
                    {roles.canDelete && <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">Delete</span>}
                  </div>
                </div>
              )}

              {settings.hasAny && (
                <div className="rounded-2xl bg-white p-6 shadow-md border-l-4 border-green-500">
                  <h3 className="text-lg font-bold">⚙️ Settings</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {settings.canView && <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">View</span>}
                    {settings.canEdit && <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">Edit</span>}
                  </div>
                </div>
              )}

            </div>

            {!users.hasAny && !reports.hasAny && !roles.hasAny && !settings.hasAny && (
              <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-md">
                <p className="text-5xl">🔒</p>
                <h2 className="mt-4 text-2xl font-bold text-red-600">
                  No Modules Assigned
                </h2>
                <p className="mt-2 text-slate-500">
                  Your account has no permissions assigned yet. Please contact your administrator.
                </p>
              </div>
            )}

          </div>

        </section>
      </main>
    </div>
  );
}