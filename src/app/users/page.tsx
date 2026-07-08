"use client";

import { useEffect, useState, useCallback } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import PermissionGuard from "@/components/PermissionGuard";

type Permission = {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
};

type PermissionsMap = {
  [module: string]: Permission;
};

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

const MODULES = ["Users", "Reports", "Roles", "Settings"];

const defaultPermissions = (): PermissionsMap => {
  const perms: PermissionsMap = {};
  MODULES.forEach((mod) => {
    perms[mod] = { view: false, create: false, edit: false, delete: false, export: false };
  });
  return perms;
};

export default function UsersPage() {
  const { canCreate, canEdit, canDelete } = usePermissions("Users");

  const [users, setUsers] = useState<User[]>([]);

  // ── Create User State ──
  const [showCreate, setShowCreate] = useState(false);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState<PermissionsMap>(defaultPermissions());

  // ── Edit User State ──
  const [showEdit, setShowEdit] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRoleName, setEditRoleName] = useState("");
  const [editPermissions, setEditPermissions] = useState<PermissionsMap>(defaultPermissions());

  const getToken = () => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="));
    return cookie ? cookie.split("=")[1] : "";
  };

  const fetchUsers = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/api/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  const fetchUserPermissions = async (userId: number) => {
    try {
      const token = getToken();
      const response = await fetch(
        `http://127.0.0.1:8000/api/users/${userId}/permissions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        const filled = defaultPermissions();
        Object.keys(data).forEach((mod) => {
          if (filled[mod]) filled[mod] = data[mod];
        });
        setEditPermissions(filled);
      }
    } catch (error) {
      console.log(error);
      setEditPermissions(defaultPermissions());
    }
  };

  const openEdit = async (user: User) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditFirstName(user.first_name);
    setEditLastName(user.last_name);
    setEditEmail(user.email);
    setEditRoleName(user.role);
    setEditPermissions(defaultPermissions());
    await fetchUserPermissions(user.id);
    setShowEdit(true);
  };

  // ── Toggle helpers for CREATE permissions ──
  const togglePermission = (mod: string, action: keyof Permission) => {
    setPermissions((prev) => ({
      ...prev,
      [mod]: { ...prev[mod], [action]: !prev[mod][action] },
    }));
  };

  const toggleRow = (mod: string) => {
    const allChecked = ["view", "create", "edit", "delete"].every(
      (a) => permissions[mod][a as keyof Permission]
    );
    setPermissions((prev) => ({
      ...prev,
      [mod]: {
        ...prev[mod],
        view: !allChecked,
        create: !allChecked,
        edit: !allChecked,
        delete: !allChecked,
        // export is untouched by row toggle
      },
    }));
  };

  const toggleColumn = (action: keyof Permission) => {
    const allChecked = MODULES.every((mod) => permissions[mod][action]);
    setPermissions((prev) => {
      const updated = { ...prev };
      MODULES.forEach((mod) => {
        updated[mod] = { ...updated[mod], [action]: !allChecked };
      });
      return updated;
    });
  };

  // ── Toggle helpers for EDIT permissions ──
  const toggleEditPermission = (mod: string, action: keyof Permission) => {
    setEditPermissions((prev) => ({
      ...prev,
      [mod]: { ...prev[mod], [action]: !prev[mod][action] },
    }));
  };

  const toggleEditRow = (mod: string) => {
    const allChecked = ["view", "create", "edit", "delete"].every(
      (a) => editPermissions[mod][a as keyof Permission]
    );
    setEditPermissions((prev) => ({
      ...prev,
      [mod]: {
        ...prev[mod],
        view: !allChecked,
        create: !allChecked,
        edit: !allChecked,
        delete: !allChecked,
        // export is untouched by row toggle
      },
    }));
  };

  const toggleEditColumn = (action: keyof Permission) => {
    const allChecked = MODULES.every((mod) => editPermissions[mod][action]);
    setEditPermissions((prev) => {
      const updated = { ...prev };
      MODULES.forEach((mod) => {
        updated[mod] = { ...updated[mod], [action]: !allChecked };
      });
      return updated;
    });
  };

  // ── Create User ──
  const createUser = async () => {
    if (username.trim().length < 3) {
      alert("Username must be at least 3 characters");
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
    if (!email.includes("@")) {
      alert("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    if (roleName.trim() === "") {
      alert("Role is required");
      return;
    }

    try {
      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/api/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          email,
          first_name: firstName,
          last_name: lastName,
          password,
          role_name: roleName,
          permissions,
        }),
      });

      if (response.ok) {
        alert("User Created Successfully");
        setUsername("");
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setRoleName("");
        setPermissions(defaultPermissions());
        setShowCreate(false);
        fetchUsers();
      } else {
        const errorData = await response.json();
        alert(`Failed to create user: ${errorData.detail ?? "Unknown error"}`);
      }
    } catch (error) {
      console.log(error);
      alert("Network error — check if backend is running");
    }
  };

  // ── Save Edit User ──
  const saveEditUser = async () => {
    if (!editingUser) return;

    if (editUsername.trim().length < 3) {
      alert("Username must be at least 3 characters");
      return;
    }
    if (editFirstName.trim() === "") {
      alert("First Name is required");
      return;
    }
    if (editLastName.trim() === "") {
      alert("Last Name is required");
      return;
    }
    if (!editEmail.includes("@")) {
      alert("Please enter a valid email");
      return;
    }
    if (editRoleName.trim() === "") {
      alert("Role is required");
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(
        `http://127.0.0.1:8000/api/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username:   editUsername,
            email:      editEmail,
            first_name: editFirstName,
            last_name:  editLastName,
            role_name:  editRoleName,
            permissions: editPermissions,
          }),
        }
      );

      if (response.ok) {
        alert("User Updated Successfully");
        setShowEdit(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        const errorData = await response.json();
        alert(`Failed to update user: ${errorData.detail ?? "Unknown error"}`);
      }
    } catch (error) {
      console.log(error);
      alert("Network error — check if backend is running");
    }
  };

  // ── Delete User ──
  const deleteUser = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      const token = getToken();
      const response = await fetch(`http://127.0.0.1:8000/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("User Deleted Successfully");
        fetchUsers();
      } else {
        try {
          const errorData = await response.json();
          alert(`Failed to delete user: ${errorData.detail ?? "Unknown error"}`);
        } catch {
          alert(`Failed to delete user. Status: ${response.status}`);
        }
      }
    } catch (error) {
      console.log("Delete error:", error);
      alert("Network error — check if backend is running");
    }
  };

  // ✅ Export is NOT part of ACTIONS — it's a manual standalone column for Reports only
  const ACTIONS: (keyof Permission)[] = ["view", "create", "edit", "delete"];

  return (
    <PermissionGuard module="Users">
      <div className="p-10">
        <h1 className="text-4xl font-bold">Users Management</h1>

        {canCreate && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white"
          >
            {showCreate ? "Cancel" : "Create User"}
          </button>
        )}

        {/* ── Create User Form ── */}
        {showCreate && (
          <div className="mt-6 rounded-xl border p-8 shadow">
            <h2 className="mb-6 text-2xl font-bold">Create New User</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input placeholder="Username" value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded border p-3" />
              <input placeholder="First Name" value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded border p-3" />
              <input placeholder="Last Name" value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded border p-3" />
              <input placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded border p-3" />
              <input type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded border p-3" />
              <input placeholder="Role" value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="rounded border p-3" />
            </div>

            {/* Permissions Matrix */}
            <div className="mt-8">
              <h3 className="mb-3 text-lg font-semibold">Permissions</h3>
              <div className="overflow-x-auto rounded-lg border shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-left">
                      <th className="border p-3 font-semibold">Module</th>
                      {ACTIONS.map((action) => (
                        <th key={action} className="border p-3 text-center font-semibold capitalize">
                          <div className="flex flex-col items-center gap-1">
                            {action}
                            <input type="checkbox"
                              checked={MODULES.every((mod) => permissions[mod][action])}
                              onChange={() => toggleColumn(action)}
                              className="h-4 w-4 cursor-pointer accent-blue-600" />
                          </div>
                        </th>
                      ))}
                      {/* ✅ Export header — standalone, applies only to Reports row */}
                      <th className="border p-3 text-center font-semibold">
                        Export
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map((mod) => (
                      <tr key={mod} className="hover:bg-slate-50">
                        <td className="cursor-pointer border p-3 font-medium text-blue-600 hover:underline"
                          onClick={() => toggleRow(mod)}>
                          {mod}
                        </td>
                        {ACTIONS.map((action) => (
                          <td key={action} className="border p-3 text-center">
                            <input type="checkbox"
                              checked={permissions[mod][action]}
                              onChange={() => togglePermission(mod, action)}
                              className="h-4 w-4 cursor-pointer accent-blue-600" />
                          </td>
                        ))}
                        {/* ✅ Export cell — checkbox only for Reports row */}
                        <td className="border p-3 text-center">
                          {mod === "Reports" ? (
                            <input type="checkbox"
                              checked={permissions[mod].export}
                              onChange={() => togglePermission(mod, "export")}
                              className="h-4 w-4 cursor-pointer accent-green-600" />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Click module name to toggle View/Create/Edit/Delete. Click column checkbox to toggle all in that action. Export applies only to Reports.
              </p>
            </div>

            <button onClick={createUser}
              className="mt-6 rounded bg-green-600 px-6 py-3 text-white hover:bg-green-700">
              Save User
            </button>
          </div>
        )}

        {/* ── Edit User Modal ── */}
        {showEdit && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Edit User — {editingUser.username}
                </h2>
                <button
                  onClick={() => setShowEdit(false)}
                  className="rounded-full bg-slate-100 px-4 py-2 text-slate-600 hover:bg-slate-200"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600">Username</label>
                  <input value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full rounded border p-3" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600">First Name</label>
                  <input value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full rounded border p-3" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600">Last Name</label>
                  <input value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full rounded border p-3" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600">Email</label>
                  <input value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded border p-3" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-600">Role</label>
                  <input value={editRoleName}
                    onChange={(e) => setEditRoleName(e.target.value)}
                    className="w-full rounded border p-3" />
                </div>
              </div>

              {/* ✅ Edit Permissions Matrix */}
              <div className="mt-8">
                <h3 className="mb-3 text-lg font-semibold">
                  Update Permissions
                </h3>
                <div className="overflow-x-auto rounded-lg border shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-left">
                        <th className="border p-3 font-semibold">Module</th>
                        {ACTIONS.map((action) => (
                          <th key={action} className="border p-3 text-center font-semibold capitalize">
                            <div className="flex flex-col items-center gap-1">
                              {action}
                              <input type="checkbox"
                                checked={MODULES.every((mod) => editPermissions[mod][action])}
                                onChange={() => toggleEditColumn(action)}
                                className="h-4 w-4 cursor-pointer accent-blue-600" />
                            </div>
                          </th>
                        ))}
                        {/* ✅ Export header in Edit modal too */}
                        <th className="border p-3 text-center font-semibold">
                          Export
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {MODULES.map((mod) => (
                        <tr key={mod} className="hover:bg-slate-50">
                          <td className="cursor-pointer border p-3 font-medium text-blue-600 hover:underline"
                            onClick={() => toggleEditRow(mod)}>
                            {mod}
                          </td>
                          {ACTIONS.map((action) => (
                            <td key={action} className="border p-3 text-center">
                              <input type="checkbox"
                                checked={editPermissions[mod][action]}
                                onChange={() => toggleEditPermission(mod, action)}
                                className="h-4 w-4 cursor-pointer accent-blue-600" />
                            </td>
                          ))}
                          {/* ✅ Export cell — checkbox only for Reports row */}
                          <td className="border p-3 text-center">
                            {mod === "Reports" ? (
                              <input type="checkbox"
                                checked={editPermissions[mod].export}
                                onChange={() => toggleEditPermission(mod, "export")}
                                className="h-4 w-4 cursor-pointer accent-green-600" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Click module name to toggle View/Create/Edit/Delete. Click column checkbox to toggle all in that action. Export applies only to Reports.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={saveEditUser}
                  className="rounded bg-green-600 px-6 py-3 text-white hover:bg-green-700">
                  Save Changes
                </button>
                <button onClick={() => setShowEdit(false)}
                  className="rounded bg-slate-200 px-6 py-3 text-slate-700 hover:bg-slate-300">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Users Table ── */}
        <div className="mt-10 overflow-x-auto rounded-xl border shadow">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100">
                <th className="border p-4">#</th>
                <th className="border p-4">Username</th>
                <th className="border p-4">Email</th>
                <th className="border p-4">Role</th>
                {(canEdit || canDelete) && (
                  <th className="border p-4">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="border p-4">{index + 1}</td>
                  <td className="border p-4">{user.username}</td>
                  <td className="border p-4">{user.email}</td>
                  <td className="border p-4">{user.role}</td>
                  {(canEdit || canDelete) && (
                    <td className="border p-4 space-x-3">
                      {canEdit && (
                        <button
                          onClick={() => openEdit(user)}
                          className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!canCreate && !canEdit && !canDelete && (
          <p className="mt-8 font-semibold text-red-600">
            You have Read Only Access.
          </p>
        )}
      </div>
    </PermissionGuard>
  );
}