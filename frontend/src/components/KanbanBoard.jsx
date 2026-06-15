import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import ProgressChart from "./ProgressChart";

const COLUMNS = [
  { id: "todo",       label: "To Do" },
  { id: "inprogress", label: "In Progress" },
  { id: "done",       label: "Done" },
];

function KanbanBoard() {
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [connected, setConnected]   = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socket.on("connect",    () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("sync:tasks",   (all)     => { setTasks(all); setLoading(false); });
    socket.on("task:created", (task)    => setTasks((p) => [...p, task]));
    socket.on("task:updated", (updated) => setTasks((p) => p.map((t) => t.id === updated.id ? updated : t)));
    socket.on("task:moved",   ({ id, column }) => setTasks((p) => p.map((t) => t.id === id ? { ...t, column } : t)));
    socket.on("task:deleted", (id)      => setTasks((p) => p.filter((t) => t.id !== id)));

    return () => socket.disconnect();
  }, []);

  // Drag handlers
  const onDragStart = (e, task) => e.dataTransfer.setData("taskId", String(task.id));
  const onDragOver  = (e, colId) => { e.preventDefault(); setDragOverCol(colId); };
  const onDrop      = (e, colId) => {
    e.preventDefault();
    const id   = Number(e.dataTransfer.getData("taskId"));
    const task = tasks.find((t) => t.id === id);
    if (task && task.column !== colId)
      socketRef.current?.emit("task:move", { id, column: colId });
    setDragOverCol(null);
  };

  // Modal helpers
  const openCreate = (column = "todo") => { setEditingTask({ column }); setModalOpen(true); };
  const openEdit   = (task)            => { setEditingTask(task);        setModalOpen(true); };
  const closeModal = ()                => { setModalOpen(false); setEditingTask(null); };

  const handleSubmit = (data) => {
    if (data.id) socketRef.current?.emit("task:update", data);
    else         socketRef.current?.emit("task:create", data);
    closeModal();
  };

  const handleDelete = (id) => socketRef.current?.emit("task:delete", id);

  return (
    <div className="kb-wrapper">
      <h2 className="sr-only">Kanban Board</h2>

      {/* Top bar */}
      <div className="kb-topbar">
        <span className={`kb-dot ${connected ? "online" : "offline"}`} data-testid="connection-status">
          {connected ? "● Connected" : "○ Disconnected"}
        </span>
        <button className="kb-btn-primary" onClick={() => openCreate()} data-testid="add-task-btn">
          + Add Task
        </button>
      </div>

      {/* Chart */}
      <ProgressChart tasks={tasks} />

      {/* Board */}
      {loading ? (
        <p className="kb-loading" data-testid="loading-indicator">Syncing tasks…</p>
      ) : (
        <div className="kb-board" data-testid="kanban-board">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.column === col.id);
            return (
              <div
                key={col.id}
                className={`kb-col ${dragOverCol === col.id ? "kb-col--over" : ""}`}
                data-testid={`column-${col.id}`}
                onDragOver={(e) => onDragOver(e, col.id)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => onDrop(e, col.id)}
              >
                <div className="kb-col-header">
                  <span className="kb-col-title">{col.label}</span>
                  <span className="kb-col-count">{colTasks.length}</span>
                </div>
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onDragStart={onDragStart}
                  />
                ))}
                <button className="kb-btn-ghost" onClick={() => openCreate(col.id)}
                  data-testid={`add-task-${col.id}`}>
                  + Add task
                </button>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <TaskModal task={editingTask} onSubmit={handleSubmit} onClose={closeModal} />
      )}
    </div>
  );
}

export default KanbanBoard;
