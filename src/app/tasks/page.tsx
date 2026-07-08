"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import TaskForm from "@/components/TaskForm";
import TaskCard from "@/components/TaskCard";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import {
  getTasks,
  createTask as createTaskApi,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
} from "@/services/taskService";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  assigned_employee_id: number | null;
}

interface Employee {
  id: number;
  name: string;
}

interface CreateTaskData {
  title: string;
  description: string;
  assignedEmployeeId: number | null;
}

export default function TasksPage() {
  const {
    tasks,
    setTasks,
    addTask,
    removeTask,
  } = useTaskStore();
  const role = useAuthStore(
  (state) => state.role
);
console.log("ROLE =", role);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [assignedEmployeeId] =
    useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");


  const fetchTasks = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const data = await getTasks();

    setTasks(
      Array.isArray(data)
        ? data
        : []
    );
  } catch (error) {
    console.error(error);
    setError("Failed to load tasks");
  } finally {
    setLoading(false);
  }
}, [setTasks]);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/employees/"
      );

      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchTasks();
  fetchEmployees();
}, [fetchTasks, fetchEmployees]);

  const createTask = async (data: CreateTaskData) => {
  const tempTask: Task = {
    id: Date.now(),
    title: data.title,
    description: data.description,
    status: "Pending",
    assigned_employee_id:
      data.assignedEmployeeId,
  };

  addTask(tempTask);

  try {
    const response =
      await createTaskApi({
        title: data.title,
        description: data.description,
        assigned_employee_id:
          data.assignedEmployeeId,
      });

    if (response.ok) {
      toast.success(
        "Task Created Successfully"
      );

      fetchTasks();
    } else {
      removeTask(tempTask.id);
    }
  } catch (error) {
    console.error(error);
    removeTask(tempTask.id);
  }
};

const deleteTask = async (
  id: number
) => {
  removeTask(id);

  try {
    const response =
      await deleteTaskApi(id);

    if (response.ok) {
      toast.success(
        "Task Deleted Successfully"
      );
    } else {
      fetchTasks();
    }
  } catch (error) {
    console.error(error);
    fetchTasks();
  }
};

const startEdit = (
  task: Task
) => {
  setEditingId(task.id);
  setEditTitle(task.title);
  setEditDescription(
    task.description
  );
  setEditStatus(task.status);
};

const saveTask = async (
  id: number
) => {
  try {
    const response =
      await updateTaskApi(id, {
        title: editTitle,
        description:
          editDescription,
        status: editStatus,
        assigned_employee_id:
          assignedEmployeeId,
      });

    if (response.ok) {
      toast.success(
        "Task Updated Successfully"
      );

      setEditingId(null);
      fetchTasks();
    }
  } catch (error) {
    console.error(error);
  }
};

const updateTaskStatus =
  async (
    id: number,
    status: string
  ) => {
    try {
      const task = tasks.find(
        (t) => t.id === id
      );

      if (!task) return;

      const response =
        await updateTaskApi(id, {
          title: task.title,
          description:
            task.description,
          status,
          assigned_employee_id:
            task.assigned_employee_id,
        });

      if (response.ok) {
        toast.success(
          "Status Updated"
        );

        fetchTasks();
      }
    } catch (error) {
      console.error(error);
    }
  };

const filteredTasks = [
  ...(Array.isArray(tasks) ? tasks : [])
]
  .filter((task) =>
    task.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  )
  .filter((task) =>
    statusFilter === "All"
      ? true
      : task.status === statusFilter
  )
  .filter((task) =>
    employeeFilter === "All"
      ? true
      : String(task.assigned_employee_id) === employeeFilter
  )
  .sort((a, b) => {
    if (sortBy === "Newest") {
      return b.id - a.id;
    }

    if (sortBy === "Oldest") {
      return a.id - b.id;
    }

    return 0;
  });
  if (loading) {

    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-3xl font-bold">
          Loading...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-3xl font-bold text-red-600">
          {error}
        </h1>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="mb-6 text-3xl font-bold">
        Tasks List
      </h1>
      <p className="mb-4 text-red-600 font-bold">
  Current Role: {role}
</p>

      {role === "admin" && (
  <TaskForm
    employees={employees}
    createTask={createTask}
  />
)}

<div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
  <input
    type="text"
    placeholder="Search by title..."
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(e.target.value)
    }
    className="rounded border p-2"
  />

  <select
    value={statusFilter}
    onChange={(e) =>
      setStatusFilter(e.target.value)
    }
    className="rounded border p-2"
  >
    <option value="All">
      All Status
    </option>

    <option value="Pending">
      Pending
    </option>

    <option value="In Progress">
      In Progress
    </option>

    <option value="Completed">
      Completed
    </option>
  </select>

  <select
    value={employeeFilter}
    onChange={(e) =>
      setEmployeeFilter(e.target.value)
    }
    className="rounded border p-2"
  >
    <option value="All">
      All Employees
    </option>

    {employees.map((employee) => (
      <option
        key={employee.id}
        value={employee.id}
      >
        {employee.name}
      </option>
    ))}
  </select>

  <select
    value={sortBy}
    onChange={(e) =>
      setSortBy(e.target.value)
    }
    className="rounded border p-2"
  >
    <option value="Newest">
      Newest First
    </option>

    <option value="Oldest">
      Oldest First
    </option>
  </select>
</div>

      {filteredTasks.map((task) => (
        <div key={task.id}>
          {editingId === task.id ? (
            <div className="mb-4 rounded-lg border p-4 shadow">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mb-3 w-full rounded border p-2"
              />

              <textarea
                value={editDescription}
                onChange={(e) =>
                  setEditDescription(e.target.value)
                }
                className="mb-3 w-full rounded border p-2"
              />

              <select
                value={editStatus}
                onChange={(e) =>
                  setEditStatus(e.target.value)
                }
                className="mb-3 w-full rounded border p-2"
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>

              <button
                onClick={() => saveTask(task.id)}
                className="rounded bg-green-600 px-4 py-2 text-white"
              >
                Save
              </button>
            </div>
          ) : (
            <TaskCard
  task={task}
  role={role}
  onStatusChange={updateTaskStatus}
  onEdit={
    role === "admin"
      ? startEdit
      : undefined
  }
  onDelete={
    role === "admin"
      ? deleteTask
      : undefined
  }
/>
          )}
        </div>
      ))}
    </div>
  );
}