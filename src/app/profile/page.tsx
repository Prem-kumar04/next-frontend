"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";

const MODULES = ["Users", "Reports", "Roles", "Settings"];
const ACTIONS = ["view", "create", "edit", "delete"] as const;

interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

type PermissionsMap = Record<string, ModulePermissions>;

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
}

interface UpdateProfileBody {
  first_name: string;
  last_name: string;
  password?: string;
}

export default function ProfilePage() {

  const { role, permissions } = useAuthStore();

  // ✅ super_admin bypasses the permission matrix — build a synthetic "all true" map
  const isSuperAdmin = role === "super_admin";

  const effectivePermissions: PermissionsMap = isSuperAdmin
    ? MODULES.reduce((acc, mod) => {
        acc[mod] = { view: true, create: true, edit: true, delete: true, export: true };
        return acc;
      }, {} as PermissionsMap)
    : permissions;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const getToken = () => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="));
    return cookie ? cookie.split("=")[1] : "";
  };

  const fetchProfile = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProfile(data);
      setFirstName(data.first_name);
      setLastName(data.last_name);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdate = async () => {
    if (password && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (firstName.trim() === "") {
      alert("First Name is required");
      return;
    }
    if (lastName.trim() === "") {
      alert("Last Name is required");
      return;
    }

    try {
      const token = getToken();
      const body: UpdateProfileBody = { first_name: firstName, last_name: lastName };
      if (password) body.password = password;

      const response = await fetch("http://127.0.0.1:8000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert("Profile Updated Successfully");
        setPassword("");
        setConfirmPassword("");
        setIsEditing(false);
        fetchProfile();
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-4xl font-bold text-slate-800">My Profile</h1>
      <p className="mt-1 text-slate-500">View and manage your account</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* ── Left Column: Profile Info ── */}
        <div className="lg:col-span-1 space-y-6">

          {/* Avatar Card */}
          <div className="rounded-2xl bg-white p-6 shadow-md text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-4xl font-bold text-white">
              {profile?.first_name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-800">
              {profile?.first_name} {profile?.last_name}
            </h2>
            <p className="mt-1 text-slate-500">{profile?.email}</p>
            <span className="mt-3 inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold capitalize text-blue-700">
              {role.replace("_", " ")}
            </span>
          </div>

          {/* Edit Profile Card */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            {isEditing ? (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600">
                    First Name
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600">
                    Last Name
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600">
                    New Password (optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleUpdate}
                  className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">First Name</span>
                  <span className="font-medium">{profile?.first_name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Last Name</span>
                  <span className="font-medium">{profile?.last_name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium">{profile?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Username</span>
                  <span className="font-medium">{profile?.username}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Permissions Matrix ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Permissions Table */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3 className="mb-4 text-lg font-bold text-slate-800">
              🔐 My Permissions
            </h3>
            <p className="mb-4 text-sm text-slate-500">
              {isSuperAdmin
                ? "As Super Admin, you have full access to all modules."
                : "These are the modules and actions assigned to your account."}
            </p>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border p-3 text-left font-semibold">Module</th>
                    {ACTIONS.map((action) => (
                      <th
                        key={action}
                        className="border p-3 text-center font-semibold capitalize"
                      >
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((mod) => {
                    const modPerms = effectivePermissions?.[mod];
                    const hasAny = modPerms && Object.values(modPerms).some(Boolean);

                    return (
                      <tr
                        key={mod}
                        className={hasAny ? "bg-white" : "bg-slate-50 opacity-50"}
                      >
                        <td className="border p-3 font-medium text-slate-700">
                          {mod}
                        </td>
                        {ACTIONS.map((action) => (
                          <td key={action} className="border p-3 text-center">
                            {modPerms?.[action] ? (
                              <span className="text-green-600 text-lg">✅</span>
                            ) : (
                              <span className="text-slate-300 text-lg">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-4 flex gap-6 text-sm text-slate-500">
              <span>✅ Permission granted</span>
              <span>— No access</span>
            </div>
          </div>

          {/* Access Summary */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3 className="mb-4 text-lg font-bold text-slate-800">
              📋 Access Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {MODULES.map((mod) => {
                const modPerms = effectivePermissions?.[mod];
                const hasAny = modPerms && Object.values(modPerms).some(Boolean);

                return (
                  <div
                    key={mod}
                    className={`rounded-xl border p-4 ${
                      hasAny
                        ? "border-green-200 bg-green-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">{mod}</span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          hasAny
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {hasAny ? "Accessible" : "No Access"}
                      </span>
                    </div>
                    {hasAny && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {ACTIONS.filter(
                          (action) => modPerms?.[action]
                        ).map((action) => (
                          <span
                            key={action}
                            className="rounded-full bg-blue-100 px-2 py-1 text-xs capitalize text-blue-700"
                          >
                            {action}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}