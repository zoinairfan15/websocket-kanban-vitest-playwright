import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import KanbanBoard from "../../components/KanbanBoard.jsx";

vi.mock("socket.io-client", () => {
  const handlers = {};
  const socket = {
    on: vi.fn((event, cb) => { handlers[event] = cb; }),
    emit: vi.fn(),
    disconnect: vi.fn(),
    _trigger: (event, data) => handlers[event]?.(data),
  };
  return { io: vi.fn(() => socket) };
});

describe("KanbanBoard", () => {
  it("renders Kanban board title", () => {
    render(<KanbanBoard />);
    expect(screen.getByText("Kanban Board")).toBeInTheDocument();
  });

  it("shows loading indicator initially", () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
  });

  it("shows Add Task button", () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId("add-task-btn")).toBeInTheDocument();
  });

  it("shows three columns after sync", async () => {
    const { io } = await import("socket.io-client");
    const socket = io();
    render(<KanbanBoard />);
    socket._trigger("sync:tasks", []);
    await waitFor(() => {
      expect(screen.getByTestId("column-todo")).toBeInTheDocument();
      expect(screen.getByTestId("column-inprogress")).toBeInTheDocument();
      expect(screen.getByTestId("column-done")).toBeInTheDocument();
    });
  });

  it("opens modal when Add Task is clicked", async () => {
    const { io } = await import("socket.io-client");
    const socket = io();
    render(<KanbanBoard />);
    socket._trigger("sync:tasks", []);
    await waitFor(() => screen.getByTestId("column-todo"));
    fireEvent.click(screen.getByTestId("add-task-btn"));
    expect(screen.getByTestId("task-modal")).toBeInTheDocument();
  });

  it("closes modal when Cancel is clicked", async () => {
    const { io } = await import("socket.io-client");
    const socket = io();
    render(<KanbanBoard />);
    socket._trigger("sync:tasks", []);
    await waitFor(() => screen.getByTestId("column-todo"));
    fireEvent.click(screen.getByTestId("add-task-btn"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByTestId("task-modal")).not.toBeInTheDocument();
  });
});