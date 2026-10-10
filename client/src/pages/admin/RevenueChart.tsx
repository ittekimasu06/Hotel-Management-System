import { useState } from "react";
import { money } from "./adminApi";

const MONTHS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

// Một chuỗi dữ liệu: màu slot 1 (đã kiểm tra tương phản với nền sáng), chữ dùng màu chữ, không dùng màu chuỗi
const BAR = "#2a78d6";
const GRID = "#e4e3df";
const TEXT_MUTED = "#6c757d";

const W = 720;
const H = 260;
const PAD = { top: 16, right: 12, bottom: 28, left: 56 };
const BAR_MAX = 24;
const RADIUS = 4;

function niceMax(v: number) {
  if (v <= 0) return 100;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

/** Cột có đầu bo tròn 4px phía trên, vuông ở đường gốc */
function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(RADIUS, h, w / 2);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

/** Doanh thu theo tháng trong năm (một chuỗi, nên không cần chú giải; tiêu đề đã nêu tên chuỗi) */
export function RevenueChart({ year, values }: { year: number; values: number[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const max = niceMax(Math.max(...values));
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const band = plotW / values.length;
  const barW = Math.min(BAR_MAX, band * 0.6);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="h6 mb-0">Doanh thu theo tháng · {year}</h2>
          <button className="btn btn-link btn-sm p-0" onClick={() => setShowTable((s) => !s)}>
            {showTable ? "Xem biểu đồ" : "Xem bảng"}
          </button>
        </div>
        <p className="small text-muted mb-2">Tổng tiền các đơn đã thanh toán, chưa hủy, theo tháng tạo đơn.</p>

        {showTable ? (
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th>Tháng</th>
                <th className="text-end">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {values.map((v, i) => (
                <tr key={i}>
                  <td>Tháng {i + 1}</td>
                  <td className="text-end">{money(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="position-relative">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-100" role="img" aria-label={`Doanh thu theo tháng năm ${year}`}>
              {ticks.map((t) => (
                <g key={t}>
                  <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
                  <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={TEXT_MUTED}>
                    {money(t)}
                  </text>
                </g>
              ))}
              {values.map((v, i) => {
                const cx = PAD.left + band * i + band / 2;
                const h = (v / max) * plotH;
                return (
                  <g key={i}>
                    {v > 0 && (
                      <path d={barPath(cx - barW / 2, y(v), barW, h)} fill={BAR} opacity={hover === null || hover === i ? 1 : 0.55} />
                    )}
                    <text x={cx} y={H - 8} textAnchor="middle" fontSize={11} fill={TEXT_MUTED}>
                      {MONTHS[i]}
                    </text>
                    {/* Vùng nhận hover phủ cả cột tháng, lớn hơn thanh dữ liệu */}
                    <rect
                      x={PAD.left + band * i}
                      y={PAD.top}
                      width={band}
                      height={plotH}
                      fill="transparent"
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                    />
                  </g>
                );
              })}
            </svg>
            {values.every((v) => v === 0) && (
              <div className="position-absolute top-50 start-50 translate-middle small text-muted bg-white px-2">
                Chưa có doanh thu trong năm {year}
              </div>
            )}
            {hover !== null && (
              <div
                className="position-absolute bg-white border rounded shadow-sm px-2 py-1 small pe-none"
                style={{
                  left: `${((PAD.left + band * hover + band / 2) / W) * 100}%`,
                  top: `${(y(values[hover]) / H) * 100}%`,
                  transform: "translate(-50%, calc(-100% - 8px))",
                  whiteSpace: "nowrap",
                }}
              >
                <div className="text-muted">Tháng {hover + 1}</div>
                <div className="fw-semibold">{money(values[hover])}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
