import { create } from "zustand";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  assigned_employee_id: number | null;
}

interface TaskState {
  tasks: Task[];

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  removeTask: (id: number) => void;
}

export const useTaskStore = create<TaskState>(
  (set) => ({
    tasks: [],

    setTasks: (tasks) =>
      set({
        tasks,
      }),

    addTask: (task) =>
      set((state) => ({
        tasks: [task, ...state.tasks],
      })),

    removeTask: (id) =>
      set((state) => ({
        tasks: state.tasks.filter(
          (task) => task.id !== id
        ),
      })),
  })
);