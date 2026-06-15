import React from "react";

const PRIORITY_COLOR = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" };
const CATEGORY_COLOR = { Bug: "#ef4444", Feature: "#6366f1", Enhancement: "#06b6d4" };

function TaskCard({ task, onEdit, onDelete, onDragStart }) {
  return (
    <div
      className="kb-card"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      data-testid={`task-card-${task.id}`}
    >
      <div className="kb-card-badges">
        <span className="kb-badge" style={{ background: PRIORITY_COLOR[task.priority] }}
          data-testid={`priority-${task.id}`}>{task.priority}</span>
        <span className="kb-badge" style={{ background: CATEGORY_COLOR[task.category] }}
          data-testid={`category-${task.id}`}>{task.category}</span>
      </div>

      <p className="kb-card-title" data-testid={`task-title-${task.id}`}>{task.title}</p>
      {task.description && <p className="kb-card-desc">{task.description}</p>}

      {/* Attachment previews */}
      {task.attachments?.map((att, i) =>
        att.type?.startsWith("image/")
          ? <img key={i} src={att.url} alt={att.name} className="kb-att-img" />
          : <a  key={i} href={att.url} className="kb-att-link">📎 {att.name}</a>
      )}

      <div className="kb-card-actions">
        <button onClick={() => onEdit(task)}      data-testid={`edit-task-${task.id}`}>Edit</button>
        <button onClick={() => onDelete(task.id)} data-testid={`delete-task-${task.id}`}
          className="kb-btn-danger">Delete</button>
      </div>
    </div>
  );
}

export default TaskCard;