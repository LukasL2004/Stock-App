import { useEffect, useRef, useState } from "react";
import { createChart, LineSeries, CrosshairMode, LineStyle, type UTCTimestamp } from "lightweight-charts";
import "./Charts.css";
import { cssVar, useTheme } from "../../lib/useTheme";
import { pct } from "../../lib/format";
export type { Point, Range } from "./ranges";

import { rangeLabel, type Point, type Range } from "./ranges";

interface Props {
  symbol: string;
  data: Point[];
  loading?: boolean;
  dir: "up" | "down" | "flat";
  range: Range;
  ranges: Range[];
  onRangeChange: (r: Range) => void;
  onHover?: (p: Point | null) => void;
  height?: number;
}

/** Robinhood-style line: no grid, no axes, dotted reference at the range start, date label follows the cursor. */
export default function Charts({ symbol, data, loading, dir, range, ranges, onRangeChange, onHover, height = 320 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cursor, setCursor] = useState<{ x: number; time: number } | null>(null);
  const { resolved } = useTheme();
  const hoverCb = useRef(onHover);
  useEffect(() => {
    hoverCb.current = onHover;
  }, [onHover]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || data.length === 0) return;

    const lineColor = cssVar(dir === "down" ? "--down-vivid" : "--up-vivid");
    const chart = createChart(el, {
      autoSize: true,
      layout: { background: { color: "transparent" }, textColor: cssVar("--text-3"), attributionLogo: false },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: { color: cssVar("--text-3"), width: 1, style: LineStyle.Solid, labelVisible: false },
        horzLine: { visible: false, labelVisible: false },
      },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: { visible: false, fixLeftEdge: true, fixRightEdge: true },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addSeries(LineSeries, {
      color: lineColor,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: cssVar("--bg"),
      crosshairMarkerBackgroundColor: lineColor,
      crosshairMarkerBorderWidth: 2,
    });
    series.setData(data.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
    series.createPriceLine({ price: data[0].value, color: cssVar("--border-strong"), lineWidth: 1, lineStyle: LineStyle.Dotted, axisLabelVisible: false, title: "" });
    chart.timeScale().fitContent();

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point || param.point.x < 0 || param.point.x > el.clientWidth) {
        setCursor(null);
        hoverCb.current?.(null);
        return;
      }
      const d = param.seriesData.get(series) as { value?: number } | undefined;
      if (d?.value !== undefined) {
        setCursor({ x: param.point.x, time: param.time as number });
        hoverCb.current?.({ time: param.time as number, value: d.value });
      }
    });

    return () => {
      chart.remove();
      setCursor(null);
      hoverCb.current?.(null);
    };
  }, [data, dir, resolved]);

  const first = data[0]?.value;
  const last = data[data.length - 1]?.value;
  const changePct = first && last !== undefined ? ((last - first) / first) * 100 : 0;
  const activeColor = dir === "down" ? "var(--down)" : "var(--up)";
  const activeBg = dir === "down" ? "var(--down-soft)" : "var(--up-soft)";

  return (
    <div className="chart">
      <div className="chart-canvas" ref={containerRef} style={{ height }} role="img" aria-label={`${symbol} price chart, ${pct(changePct)} ${rangeLabel(range).toLowerCase()}`}>
        {cursor && (
          <span className="chart-date num" style={{ left: cursor.x }}>
            {new Date(cursor.time * 1000).toLocaleString("en-US", range === "1D" ? { hour: "numeric", minute: "2-digit" } : { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
        {loading && <span className="chart-loading" aria-hidden="true" />}
        {!loading && data.length === 0 && <p className="chart-empty">No price history for {symbol} yet.</p>}
      </div>
      <div className="tabs chart-ranges" role="group" aria-label="Time range" style={{ ["--tabs-active" as string]: activeColor, ["--tabs-active-bg" as string]: activeBg }}>
        {ranges.map((r) => (
          <button key={r} aria-pressed={range === r} onClick={() => onRangeChange(r)}>
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
