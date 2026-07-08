"use client";

import { useEffect, useState, useCallback } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import PermissionGuard from "@/components/PermissionGuard";

interface Report {
  id: number;
  title: string;
  description: string;
  created_by: string;
}

export default function ReportsPage() {

  // ✅ canExport added
  const { canCreate, canEdit, canDelete, canExport } = usePermissions("Reports");

  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [createdBy, setCreatedBy] = useState("");

  const getToken = () => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="));
    return cookie ? cookie.split("=")[1] : "";
  };

  const fetchReports = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/api/reports/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
  }, [fetchReports]);

  const createReport = async () => {
    if (title.trim().length < 3) {
      alert("Title must contain at least 3 characters");
      return;
    }
    if (description.trim().length < 5) {
      alert("Description must contain at least 5 characters");
      return;
    }
    if (createdBy.trim().length < 3) {
      alert("Created By is required");
      return;
    }

    try {
      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/api/reports/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          created_by: createdBy,
        }),
      });

      if (response.ok) {
        alert("Report Created Successfully");
        setTitle("");
        setDescription("");
        setCreatedBy("");
        setShowCreate(false);
        fetchReports();
      } else {
        alert("Failed to create report");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const searchReports = async () => {
    if (!search.trim()) {
      fetchReports();
      return;
    }
    try {
      const token = getToken();
      const response = await fetch(
        `http://127.0.0.1:8000/api/reports/search?keyword=${search}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.log(error);
    }
  };

  const exportReports = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        "http://127.0.0.1:8000/api/reports/export",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();

      const csv = ["ID,Title,Description"];
      data.reports.forEach((item: Report) => {
        csv.push(`${item.id},${item.title},${item.description}`);
      });

      const blob = new Blob([csv.join("\n")], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reports.csv";
      a.click();

      alert("Reports Exported Successfully");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <PermissionGuard module="Reports">
      <div className="p-10">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Reports Management</h1>

          {/* ✅ Export now gated by canExport */}
          {canExport && (
            <button
              onClick={exportReports}
              className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 flex items-center gap-2"
            >
              ⬇️ Export Reports
            </button>
          )}
        </div>

        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search Report"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-80 rounded border p-3"
          />
          <button
            onClick={searchReports}
            className="rounded bg-blue-600 px-5 py-3 text-white"
          >
            Search
          </button>

          {canCreate && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="rounded bg-purple-600 px-5 py-3 text-white"
            >
              {showCreate ? "Cancel" : "Create Report"}
            </button>
          )}
        </div>

        {showCreate && (
          <div className="mb-8 rounded-xl border p-6">
            <h2 className="mb-5 text-2xl font-bold">Create Report</h2>
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-4 w-full rounded border p-3"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mb-4 w-full rounded border p-3"
            />
            <input
              placeholder="Created By"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              className="mb-4 w-full rounded border p-3"
            />
            <button
              onClick={createReport}
              className="rounded bg-green-600 px-5 py-3 text-white"
            >
              Save Report
            </button>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border shadow">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100">
                <th className="border p-4">ID</th>
                <th className="border p-4">Title</th>
                <th className="border p-4">Description</th>
                <th className="border p-4">Created By</th>
                {(canEdit || canDelete) && (
                  <th className="border p-4">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={report.id} className="hover:bg-slate-50">
                  <td className="border p-4">{index + 1}</td>
                  <td className="border p-4">{report.title}</td>
                  <td className="border p-4">{report.description}</td>
                  <td className="border p-4">{report.created_by}</td>
                  {(canEdit || canDelete) && (
                    <td className="border p-4 space-x-3">
                      {canEdit && (
                        <button
                          onClick={async () => {
                            const newTitle = prompt("Title", report.title);
                            if (!newTitle) return;
                            const newDesc = prompt("Description", report.description);
                            if (!newDesc) return;
                            const token = getToken();
                            const res = await fetch(
                              `http://127.0.0.1:8000/api/reports/${report.id}`,
                              {
                                method: "PUT",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                  title: newTitle,
                                  description: newDesc,
                                  created_by: report.created_by,
                                }),
                              }
                            );
                            if (res.ok) {
                              alert("Report Updated Successfully");
                              fetchReports();
                            } else {
                              alert("Failed to update report");
                            }
                          }}
                          className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={async () => {
                            const confirmDelete = window.confirm("Are you sure?");
                            if (!confirmDelete) return;
                            const token = getToken();
                            const res = await fetch(
                              `http://127.0.0.1:8000/api/reports/${report.id}`,
                              {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                              }
                            );
                            if (res.ok) {
                              alert("Report Deleted Successfully");
                              fetchReports();
                            } else {
                              alert("Failed to delete report");
                            }
                          }}
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