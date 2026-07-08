import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskForm from "../TaskForm";

describe("TaskForm", () => {
  it("submits valid task data", async () => {
    const createTaskMock = jest.fn();

    render(
      <TaskForm
        employees={[
          {
            id: 1,
            name: "Prem",
          },
        ]}
        createTask={createTaskMock}
      />
    );

    await userEvent.type(
      screen.getByPlaceholderText(
        "Task Title"
      ),
      "New Task"
    );

    await userEvent.type(
      screen.getByPlaceholderText(
        "Task Description"
      ),
      "Testing Task Creation"
    );

    await userEvent.selectOptions(
      screen.getByRole("combobox"),
      "1"
    );

    await userEvent.click(
      screen.getByText("Create Task")
    );

    expect(
      createTaskMock
    ).toHaveBeenCalled();
  });
});
it("shows validation errors for empty form", async () => {
  render(
    <TaskForm
      employees={[
        {
          id: 1,
          name: "Prem",
        },
      ]}
      createTask={jest.fn()}
    />
  );

  await userEvent.click(
    screen.getByText("Create Task")
  );

  expect(
    screen.getByText(
      "Title must be at least 3 characters"
    )
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      "Description must be at least 5 characters"
    )
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      "Please select an employee"
    )
  ).toBeInTheDocument();
});