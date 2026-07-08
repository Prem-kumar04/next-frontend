"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const taskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),

  description: z
    .string()
    .min(5, "Description must be at least 5 characters"),

  assignedEmployeeId: z
    .number()
    .min(1, "Please select an employee"),
});

type TaskFormData = z.infer<typeof taskSchema>;

type Employee = {
  id: number;
  name: string;
};

type TaskFormProps = {
  employees: Employee[];
  createTask: (data: TaskFormData) => void;
};

export default function TaskForm({
  employees,
  createTask,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = (data: TaskFormData) => {
    createTask(data);
    reset();
  };

  return (
    <div className="mb-8 rounded-lg border bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">
        Create New Task
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div>
          <input
            type="text"
            placeholder="Task Title"
            {...register("title")}
            className="w-full rounded border p-3"
          />

          {errors.title && (
            <p className="mt-1 text-sm text-red-600">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <textarea
            placeholder="Task Description"
            {...register("description")}
            className="w-full rounded border p-3"
          />

          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <select
  {...register("assignedEmployeeId", {
    valueAsNumber: true,
  })}
  className="w-full rounded border p-3"
>
  <option value="0">
    Select Employee
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
          {errors.assignedEmployeeId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.assignedEmployeeId.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Create Task
        </button>
      </form>
    </div>
  );
}