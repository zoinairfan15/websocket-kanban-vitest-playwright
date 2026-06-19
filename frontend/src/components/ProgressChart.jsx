import React from "react";

const COLS = [
  { id: "todo",       label: "To Do",      color: "#6366f1" },
  { id: "inprogress", label: "In Progress", color: "#f59e0b" },
  { id: "done",       label: "Done",        color: "#22c55e" },
];

function ProgressChart({ tasks }) {
  const total     = tasks.length;
  const doneCount = tasks.filter((t) => t.column === "done").length;
  const pct       = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  // Calculate pie slices
  const getSlices = () => {
    if (total === 0) return [];
    let cumulative = 0;
    return COLS.map((col) => {
      const count   = tasks.filter((t) => t.column === col.id).length;
      const percent = (count / total) * 100;
      const slice   = { ...col, count, percent, start: cumulative };
      cumulative   += percent;
      return slice;
    }).filter((s) => s.count > 0);
  };

  const slices = getSlices();

  // Convert percent to SVG arc path
  const getArcPath = (startPercent, percent) => {
    const r  = 15.9;
    const cx = 18, cy = 18;
    const startAngle = (startPercent / 100) * 360 - 90;
    const endAngle   = ((startPercent + percent) / 100) * 360 - 90;
    const start = {
      x: cx + r * Math.cos((startAngle * Math.PI) / 180),
      y: cy + r * Math.sin((startAngle * Math.PI) / 180),
    };
    const end = {
      x: cx + r * Math.cos((endAngle * Math.PI) / 180),
      y: cy + r * Math.sin((endAngle * Math.PI) / 180),
    };
    const largeArc = percent > 50 ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };

  return (
    <div className="kb-chart" data-testid="progress-chart">

      {/* Pie Chart */}
      <div className="kb-pie-wrap">
        <svg viewBox="0 0 36 36" width="140" height="140">
          {total === 0 ? (
            <circle cx="18" cy="18" r="15.9" fill="#e5e7eb" />
          ) : (
            slices.map((slice) => (
              <path
                key={slice.id}
                d={getArcPath(slice.start, slice.percent)}
                fill={slice.color}
                stroke="#fff"
                strokeWidth="0.5"
              />
            ))
          )}
        </svg>

        {/* Legend */}
        <div className="kb-pie-legend">
          {COLS.map((col) => {
            const count = tasks.filter((t) => t.column === col.id).length;
            return (
              <div key={col.id} className="kb-legend-item">
                <span className="kb-legend-dot" style={{ background: col.color }} />
                <span>{col.label}: {count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bar chart */}
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