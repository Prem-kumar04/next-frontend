import { render, screen } from "@testing-library/react";
import TaskCard from "../TaskCard";
import userEvent from "@testing-library/user-event";

describe("TaskCard", () => {
  it("renders task title", () => {
    render(
      <TaskCard
        task={{
          id: 1,
          title: "Test Task",
          description: "Testing",
          status: "Pending",
          assigned_employee_id: null,
        }}
      />
    );

    expect(
      screen.getByText("Test Task")
    ).toBeInTheDocument();
  });
});

it("renders task description", () => {
  render(
    <TaskCard
      task={{
        id: 1,
        title: "Test Task",
        description: "Testing Description",
        status: "Pending",
        assigned_employee_id: null,
      }}
    />
  );

  expect(
    screen.getByText(
      "Testing Description"
    )
  ).toBeInTheDocument();
});

it("renders task status", () => {
  render(
    <TaskCard
      task={{
        id: 1,
        title: "Test Task",
        description: "Testing Description",
        status: "Completed",
        assigned_employee_id: null,
      }}
    />
  );

  expect(
    screen.getByText(
      "Status: Completed"
    )
  ).toBeInTheDocument();
});

it("shows Edit button when onEdit is provided", () => {
  render(
    <TaskCard
      task={{
        id: 1,
        title: "Test Task",
        description: "Testing",
        status: "Pending",
        assigned_employee_id: null,
      }}
      onEdit={() => {}}
    />
  );

  expect(
    screen.getByText("Edit")
  ).toBeInTheDocument();
});

it("does not show Edit button when onEdit is not provided", () => {
  render(
    <TaskCard
      task={{
        id: 1,
        title: "Test Task",
        description: "Testing",
        status: "Pending",
        assigned_employee_id: null,
      }}
    />
  );

  expect(
    screen.queryByText("Edit")
  ).not.toBeInTheDocument();
});

it("shows Delete button when onDelete is provided", () => {
  render(
    <TaskCard
      task={{
        id: 1,
        title: "Test Task",
        description: "Testing",
        status: "Pending",
        assigned_employee_id: null,
      }}
      onDelete={() => {}}
    />
  );

  expect(
    screen.getByText("Delete")
  ).toBeInTheDocument();
});

it("calls onEdit when Edit button is clicked", async () => {
  const editMock = jest.fn();

  render(
    <TaskCard
      task={{
        id: 1,
        title: "Test Task",
        description: "Testing",
        status: "Pending",
        assigned_employee_id: null,
      }}
      onEdit={editMock}
    />
  );

  await userEvent.click(
    screen.getByText("Edit")
  );

  expect(editMock).toHaveBeenCalled();
});

it("calls onDelete when Delete button is clicked", async () => {
  const deleteMock = jest.fn();

  render(
    <TaskCard
      task={{
        id: 1,
        title: "Test Task",
        description: "Testing",
        status: "Pending",
        assigned_employee_id: null,
      }}
      onDelete={deleteMock}
    />
  );

  await userEvent.click(
    screen.getByText("Delete")
  );

  expect(deleteMock).toHaveBeenCalledWith(1);
});