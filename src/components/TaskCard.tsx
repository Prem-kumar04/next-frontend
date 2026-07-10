interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  assigned_employee_id: number | null;
}

type TaskCardProps = {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
  role?: string;
  onStatusChange?: (
    id: number,
    status: string
  ) => void;
};

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  role,
  onStatusChange,
}: Readonly<TaskCardProps>) {
  return (
    <div className="mb-4 rounded-lg border p-4 shadow">
      <h2 className="text-xl font-semibold">
        {task.title}
      </h2>

      <p>{task.description}</p>

      {role === "user" ? (
        <div className="mt-2">
          <label className="font-medium">
            Status:
          </label>

          <select
            defaultValue={task.status}
            onChange={(e) =>
              onStatusChange?.(
                task.id,
                e.target.value
              )
            }
            className="ml-2 rounded border p-1"
          >
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
        </div>
      ) : (
        <p className="mt-2 font-medium">
          Status: {task.status}
        </p>
      )}

      {onEdit && (
        <button
          onClick={() => onEdit(task)}
          className="mr-2 mt-4 rounded bg-yellow-500 px-4 py-2 text-white"
        >
          Edit
        </button>
      )}

      {onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          className="mt-4 rounded bg-red-600 px-4 py-2 text-white"
        >
          Delete
        </button>
      )}
    </div>
  );
}