import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import KanbanBoard from "../../components/KanbanBoard.jsx";

let socketHandlers = {};
let socketEmit = vi.fn();

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: vi.fn((event, cb) => { socketHandlers[event] = cb; }),
    emit: socketEmit,
    disconnect: vi.fn(),
  })),
}));

const trigger = (event, data) => act(() => socketHandlers[event]?.(data));

beforeEach(() => {
  socketHandlers = {};
  socketEmit.mockClear();
});

describe("WebSocket Integration", () => {
  it("shows tasks received from server", async () => {
    render(<KanbanBoard />);
    trigger("sync:tasks", [
      { id: 1, title: "Fix bug", priority: "High", category: "Bug", column: "todo", attachments: [] },
    ]);
    await waitFor(() => expect(screen.getByText("Fix bug")).toBeInTheDocument());
  });

  it("adds task when task:created fires", async () => {
    render(<KanbanBoard />);
    trigger("sync:tasks", []);
    await waitFor(() => screen.getByTestId("column-todo"));
    trigger("task:created", { id: 2, title: "New Feature", priority: "Medium", category: "Feature", column: "todo", attachments: [] });
    await waitFor(() => expect(screen.getByText("New Feature")).toBeInTheDocument());
  });

  it("removes task when task:deleted fires", async () => {
    render(<KanbanBoard />);
    trigger("sync:tasks", [
      { id: 3, title: "Remove Me", priority: "Low", category: "Bug", column: "todo", attachments: [] },
    ]);
    await waitFor(() => screen.getByText("Remove Me"));
    trigger("task:deleted", 3);
    await waitFor(() => expect(screen.queryByText("Remove Me")).not.toBeInTheDocument());
  });

  it("moves task when task:moved fires", async () => {
    render(<KanbanBoard />);
    trigger("sync:tasks", [
      { id: 4, title: "Move Me", priority: "Low", category: "Feature", column: "todo", attachments: [] },
    ]);
    await waitFor(() => screen.getByTestId("column-todo"));
    trigger("task:moved", { id: 4, column: "done" });
    await waitFor(() => {
      expect(screen.getByTestId("column-done")).toHaveTextContent("Move Me");
    });
  });

  it("updates task when task:updated fires", async () => {
    render(<KanbanBoard />);
    trigger("sync:tasks", [
      { id: 5, title: "Old Title", priority: "Low", category: "Bug", column: "todo", attachments: [] },
    ]);
    await waitFor(() => screen.getByText("Old Title"));
    trigger("task:updated", { id: 5, title: "New Title", priority: "High", category: "Bug", column: "todo", attachments: [] });
    await waitFor(() => expect(screen.getByText("New Title")).toBeInTheDocument());
    expect(screen.queryByText("Old Title")).not.toBeInTheDocument();
  });

  it("emits task:create when form submitted", async () => {
    render(<KanbanBoard />);
    trigger("sync:tasks", []);
    await waitFor(() => screen.getByTestId("add-task-btn"));
    fireEvent.click(screen.getByTestId("add-task-btn"));
    fireEvent.change(screen.getByTestId("task-title-input"), { target: { value: "Socket Task" } });
    fireEvent.click(screen.getByTestId("submit-task-btn"));
    expect(socketEmit).toHaveBeenCalledWith("task:create", expect.objectContaining({ title: "Socket Task" }));
  });

  it("emits task:delete when delete clicked", async () => {
    render(<KanbanBoard />);
    trigger("sync:tasks", [
      { id: 6, title: "Delete Me", priority: "Low", category: "Bug", column: "todo", attachments: [] },
    ]);
    await waitFor(() => screen.getByText("Delete Me"));
    fireEvent.click(screen.getByTestId("delete-task-6"));
    expect(socketEmit).toHaveBeenCalledWith("task:delete", 6);
  });
});
