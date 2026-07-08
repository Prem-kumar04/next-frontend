"use client";

import { useEffect, useState, useCallback } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import PermissionGuard from "@/components/PermissionGuard";

interface Role {
  id: number;
  name: string;
  description: string;
}

export default function RolesPage() {

  const { canCreate, canEdit, canDelete } = usePermissions("Roles");

  const [roles, setRoles] = useState<Role[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const getToken = () => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="));
    return cookie ? cookie.split("=")[1] : "";
  };

  const fetchRoles = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/api/roles/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoles();
  }, [fetchRoles]);

  const createRole = async () => {
    if (name.trim().length < 3) {
      alert("Role name must contain at least 3 characters");
      return;
    }
    if (description.trim().length < 5) {
      alert("Description must contain at least 5 characters");
      return;
    }

    try {
      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/api/roles/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        alert("Role Created Successfully");
        setName("");
        setDescription("");
        setShowCreate(false);
        fetchRoles();
      } else {
        alert("Failed to create role");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const editRole = async (roleData: Role) => {
    const newName = prompt("Role Name", roleData.name);
    if (!newName) return;

    const newDescription = prompt("Description", roleData.description);
    if (!newDescription) return;

    const token = getToken();
    const response = await fetch(
      `http://127.0.0.1:8000/api/roles/${roleData.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          description: newDescription,
        }),
      }
    );

    if (response.ok) {
      alert("Role Updated Successfully");
      fetchRoles();
    }
  };

  const deleteRole = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    try {
      const token = getToken();
      const response = await fetch(
        `http://127.0.0.1:8000/api/roles/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert("Role Deleted Successfully");
        fetchRoles();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <PermissionGuard module="Roles">
      <div className="p-10">
        <h1 className="text-4xl font-bold">Roles Management</h1>

        {/* ✅ canCreate instead of role === "super_admin" */}
        {canCreate && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="mt-8 rounded bg-blue-600 px-6 py-3 text-white"
          >
            {showCreate ? "Cancel" : "Create Role"}
          </button>
        )}

        {showCreate && (
          <div className="mt-6 rounded border p-6">
            <input
              type="text"
              placeholder="Role Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-4 w-full rounded border p-3"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mb-4 w-full rounded border p-3"
            />
            <button
              onClick={createRole}
              className="rounded bg-green-600 px-5 py-2 text-white"
            >
              Save
            </button>
          </div>
        )}

        <div className="mt-8 space-y-5">
          {roles.map((item, index) => (
            <div key={item.id} className="rounded border p-6">
              <p className="font-semibold text-slate-500">
                Role #{index + 1}
              </p>
              <h2 className="mt-2 text-2xl font-bold">{item.name}</h2>
              <p className="mt-2">{item.description}</p>

              {/* ✅ canEdit || canDelete instead of role === "super_admin" */}
              {(canEdit || canDelete) && (
                <div className="mt-5 space-x-3">
                  {canEdit && (
                    <button
                      onClick={() => editRole(item)}
                      className="rounded bg-yellow-500 px-5 py-2 text-white"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => deleteRole(item.id)}
                      className="rounded bg-red-600 px-5 py-2 text-white"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ✅ Show read only if user has no create/edit/delete */}
        {!canCreate && !canEdit && !canDelete && (
          <p className="mt-8 font-semibold text-red-600">
            You have Read Only Access.
          </p>
        )}
      </div>
    </PermissionGuard>
  );
}