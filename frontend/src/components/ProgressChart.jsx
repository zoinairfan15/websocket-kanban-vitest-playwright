import React from "react";

const COLS = [
  { id: "todo",       label: "To Do",       color: "#6366f1" },
  { id: "inprogress", label: "In Progress",  color: "#f59e0b" },
  { id: "done",       label: "Done",         color: "#22c55e" },
];

function ProgressChart({ tasks }) {
  const total      = tasks.length;
  const doneCount  = tasks.filter((t) => t.column === "done").length;
  const pct        = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <div className="kb-chart" data-testid="progress-chart">
      {COLS.map((col) => {
        const count  = tasks.filter((t) => t.column === col.id).length;
        const height = total === 0 ? 0 : (count / total) * 100;
        return (
          <div key={col.id} className="kb-chart-bar-wrap">
            <span className="kb-chart-count">{count}</span>
            <div className="kb-chart-track">
              <div className="kb-chart-fill"
                style={{ height: `${height}%`, background: col.color }}
                data-testid={`chart-bar-${col.id}`} />
            </div>
            <span className="kb-chart-label">{col.label}</span>
          </div>
        );
      })}

      {/* Completion ring */}
      <div className="kb-ring" data-testid="completion-percent">
        <svg viewBox="0 0 36 36" width="80" height="80">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3"
            strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset="25" strokeLinecap="round"/>
        </svg>
        <span className="kb-ring-label">{pct}%<br/><small>Done</small></span>
      </div>
    </div>
  );
}

export default ProgressChart;