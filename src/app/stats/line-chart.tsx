"use client";

import { useEffect, useRef, useState } from "react";

import { niceTicks } from "@/lib/stats";

export type Point = { x: number; y: number }; // x = day number

const HEIGHT = 160;
const MARGIN = { top: 12, right: 40, bottom: 22, left: 36 };
// Longer gaps than this (e.g. a vacation) break the line.
const GAP_DAYS = 28;

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

// Month ticks between two day numbers, thinned to about 5 labels.
function monthTicks(from: number, to: number) {
  const ticks: { x: number; label: string }[] = [];
  const start = new Date(from * 86_400_000);
  const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  while (date.getTime() / 86_400_000 <= to) {
    ticks.push({ x: date.getTime() / 86_400_000, label: "" });
    date.setUTCMonth(date.getUTCMonth() + 1);
  }
  const every = Math.max(1, Math.ceil(ticks.length / 5));
  return ticks
    .filter((_, i) => i % every === 0)
    .map((tick, i) => {
      const d = new Date(tick.x * 86_400_000);
      const month = MONTH_NAMES[d.getUTCMonth()];
      const withYear = i === 0 || d.getUTCMonth() < every;
      return { x: tick.x, label: withYear ? `${month} ’${String(d.getUTCFullYear()).slice(2)}` : month };
    });
}

export function LineChart({
  label,
  variant = "line",
  points,
  xDomain,
  formatY,
  activeIndex,
  onActiveIndexChange,
}: {
  label: string;
  // "dots" suits values that jump around between a few levels, like reps.
  variant?: "line" | "dots";
  points: Point[];
  xDomain: [number, number];
  formatY: (value: number) => string;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}) {
  const [ref, width] = useWidth();

  const ys = points.map((p) => p.y);
  const yTicks = niceTicks(Math.min(...ys), Math.max(...ys));
  const [yMin, yMax] = [yTicks[0], yTicks.at(-1)!];
  const [xMin, xMax] = xDomain[0] === xDomain[1] ? [xDomain[0] - 1, xDomain[1] + 1] : xDomain;

  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const sx = (x: number) => MARGIN.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
  const sy = (y: number) => MARGIN.top + (1 - (y - yMin) / (yMax - yMin)) * plotHeight;

  let path = "";
  points.forEach((p, i) => {
    const command = i === 0 || p.x - points[i - 1].x > GAP_DAYS ? "M" : "L";
    path += `${command}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`;
  });

  function selectAt(clientX: number, svg: SVGSVGElement) {
    const x = clientX - svg.getBoundingClientRect().left;
    let nearest = 0;
    points.forEach((p, i) => {
      if (Math.abs(sx(p.x) - x) < Math.abs(sx(points[nearest].x) - x)) nearest = i;
    });
    onActiveIndexChange(nearest);
  }

  const last = points.at(-1);
  const active = points[activeIndex];

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={label}
          tabIndex={0}
          className="touch-pan-y outline-none select-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          onPointerDown={(e) => selectAt(e.clientX, e.currentTarget)}
          onPointerMove={(e) => {
            if (e.pointerType === "mouse" || e.buttons) selectAt(e.clientX, e.currentTarget);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") onActiveIndexChange(Math.max(0, activeIndex - 1));
            if (e.key === "ArrowRight") onActiveIndexChange(Math.min(points.length - 1, activeIndex + 1));
          }}
        >
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={width - MARGIN.right}
                y1={sy(tick)}
                y2={sy(tick)}
                className="stroke-zinc-200 dark:stroke-zinc-800"
                strokeWidth={1}
              />
              <text
                x={MARGIN.left - 6}
                y={sy(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-zinc-500 text-[11px] tabular-nums"
              >
                {formatY(tick)}
              </text>
            </g>
          ))}

          {monthTicks(xMin, xMax).map((tick) => (
            <text
              key={tick.x}
              x={sx(tick.x)}
              y={HEIGHT - 6}
              textAnchor="middle"
              className="fill-zinc-500 text-[11px]"
            >
              {tick.label}
            </text>
          ))}

          {variant === "line" ? (
            <path
              d={path}
              fill="none"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              className="stroke-[#2a78d6] dark:stroke-[#3987e5]"
            />
          ) : (
            points.map((p, i) => (
              <circle
                key={i}
                cx={sx(p.x)}
                cy={sy(p.y)}
                r={4}
                strokeWidth={2}
                className="fill-[#2a78d6] stroke-white dark:fill-[#3987e5] dark:stroke-zinc-900"
              />
            ))
          )}

          {last && (
            <>
              <circle
                cx={sx(last.x)}
                cy={sy(last.y)}
                r={4}
                strokeWidth={2}
                className="fill-[#2a78d6] stroke-white dark:fill-[#3987e5] dark:stroke-zinc-900"
              />
              <text
                x={sx(last.x) + 8}
                y={sy(last.y)}
                dominantBaseline="middle"
                className="fill-zinc-700 text-[11px] font-medium tabular-nums dark:fill-zinc-300"
              >
                {formatY(last.y)}
              </text>
            </>
          )}

          {active && (
            <>
              <line
                x1={sx(active.x)}
                x2={sx(active.x)}
                y1={MARGIN.top}
                y2={HEIGHT - MARGIN.bottom}
                strokeWidth={1}
                className="stroke-zinc-400 dark:stroke-zinc-500"
              />
              <circle
                cx={sx(active.x)}
                cy={sy(active.y)}
                r={5}
                strokeWidth={2}
                className="fill-[#2a78d6] stroke-white dark:fill-[#3987e5] dark:stroke-zinc-900"
              />
            </>
          )}
        </svg>
      )}
      {width === 0 && <div style={{ height: HEIGHT }} />}
    </div>
  );
}
