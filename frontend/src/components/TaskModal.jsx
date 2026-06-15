import React, { useState } from "react";

const ALLOWED = ["image/jpeg", "image/png", "image/gif", "application/pdf"];

function TaskModal({ task, onSubmit, onClose }) {
  const isEdit = !!task?.id;
  const [form, setForm] = useState({
    id:          task?.id          ?? null,
    title:       task?.title       ?? "",
    description: task?.description ?? "",
    priority:    task?.priority    ?? "Medium",
    category:    task?.category    ?? "Feature",
    column:      task?.column      ?? "todo",
    attachments: task?.attachments ?? [],
  });
  const [fileError, setFileError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    setFileError("");
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setFileError("Unsupported type. Use JPG, PNG, GIF or PDF.");
      return;
    }
    const url = URL.createObjectURL(file);
    set("attachments", [...form.attachments, { name: file.name, url, type: file.type }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="kb-overlay" onClick={onClose} data-testid="modal-overlay">
      <div className="kb-modal" onClick={(e) => e.stopPropagation()} data-testid="task-modal">
        <h3>{isEdit ? "Edit Task" : "New Task"}</h3>
        <form onSubmit={handleSubmit}>
          <label>Title *</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder="Task title" required data-testid="task-title-input" />

          <label>Description</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
            rows={3} placeholder="Optional…" data-testid="task-desc-input" />

          <div className="kb-form-row">
            <div>
              <label>Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)}
                data-testid="priority-select">
                {["Low","Medium","High"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label>Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                data-testid="category-select">
                {["Bug","Feature","Enhancement"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>Column</label>
              <select value={form.column} onChange={(e) => set("column", e.target.value)}
                data-testid="column-select">
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <label>Attachment</label>
          <input type="file" accept=".jpg,.jpeg,.png,.gif,.pdf"
            onChange={handleFile} data-testid="file-input" />
          {fileError && <p className="kb-error" data-testid="file-error">{fileError}</p>}
          {form.attachments.map((a, i) =>
            a.type?.startsWith("image/")
              ? <img key={i} src={a.url} alt={a.name} className="kb-att-img" />
              : <p   key={i} className="kb-att-link">📎 {a.name}</p>
          )}

          <div className="kb-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="kb-btn-primary" data-testid="submit-task-btn">
              {isEdit ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;