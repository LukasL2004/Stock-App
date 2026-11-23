import { useEffect, useRef, useState } from "react";
import { createChart, createSeriesMarkers, AreaSeries, CrosshairMode, LineStyle, LineType, type IChartApi, type ISeriesApi, type ISeriesMarkersPluginApi, type UTCTimestamp, type Time } from "lightweight-charts";
import "./Charts.css";
import { cssVar, useTheme } from "../../lib/useTheme";
import { money, pct } from "../../lib/format";
import { sliceRange, type Point, type Range } from "./ranges";
import { useI18n } from "../../i18n/useI18n";
import { getLocale } from "../../i18n/core";
export type { Point, Range } from "./ranges";

function rgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export interface VisibleWindow {
  first: Point;
  last: Point;
  high: Point;
  low: Point;
}

interface Props {
  symbol: string;
  /** Full history; the chart shows `range` and lets the user pan/zoom beyond it. */
  points: Point[];
  loading?: boolean;
  dir: "up" | "down" | "flat";
  /** Selected preset, or null when the user has panned/zoomed to a custom window. */
  range: Range | null;
  ranges: Range[];
  onRangeChange: (r: Range) => void;
  onHover?: (p: Point | null) => void;
  onVisibleChange?: (w: VisibleWindow | null, byUser: boolean) => void;
  height?: number;
}

function windowOf(points: Point[], from: number, to: number): VisibleWindow | null {
  let first: Point | undefined, last: Point | undefined, high: Point | undefined, low: Point | undefined;
  for (const p of points) {
    if (p.time < from || p.time > to) continue;
    first ??= p;
    last = p;
    if (!high || p.value > high.value) high = p;
    if (!low || p.value < low.value) low = p;
  }
  return first && last && high && low ? { first, last, high, low } : null;
}

/**
 * Brokerage-style area chart: gradient, quiet axes, high/low callouts, crosshair readout.
 * Drag to pan into the past, wheel or pinch to zoom; presets reset the window.
 */
export default function Charts({ symbol, points, loading, dir, range, ranges, onRangeChange, onHover, onVisibleChange, height = 360 }: Props) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const refLineRef = useRef<ReturnType<ISeriesApi<"Area">["createPriceLine"]> | null>(null);
  const userDirty = useRef(false);
  const spanRef = useRef<number>(30 * 86400);
  const [cursor, setCursor] = useState<{ x: number; time: number } | null>(null);
  const [intradayView, setIntradayView] = useState(false);
  const { resolved } = useTheme();
  const hoverCb = useRef(onHover);
  const visibleCb = useRef(onVisibleChange);
  useEffect(() => {
    hoverCb.current = onHover;
    visibleCb.current = onVisibleChange;
  }, [onHover, onVisibleChange]);

  // 1. Build the chart once per dataset/theme.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || points.length === 0) return;

    const dark = resolved === "dark";
    const textColor = cssVar("--text-3");
    const neutral = dark ? "#ffffff" : "#000000";
    const locale = getLocale();

    const chart = createChart(el, {
      autoSize: true,
      layout: { background: { color: "transparent" }, textColor, fontSize: 11, fontFamily: cssVar("--font-sans") || undefined, attributionLogo: false },
      grid: { vertLines: { visible: false }, horzLines: { color: rgba(neutral, dark ? 0.07 : 0.06), style: LineStyle.Solid } },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: { color: rgba(neutral, 0.35), width: 1, style: LineStyle.Solid, labelVisible: false },
        horzLine: { color: rgba(neutral, 0.25), width: 1, style: LineStyle.Dashed, labelVisible: true, labelBackgroundColor: cssVar("--cta") },
      },
      rightPriceScale: { visible: true, borderVisible: false, scaleMargins: { top: 0.14, bottom: 0.06 }, entireTextOnly: true, ticksVisible: false },
      leftPriceScale: { visible: false },
      timeScale: {
        visible: true,
        borderVisible: false,
        timeVisible: false,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: false,
        rightOffset: 0,
        minBarSpacing: 1.5,
        tickMarkFormatter: (time: number) => {
          const d = new Date(time * 1000);
          const span = spanRef.current;
          if (span < 3 * 86400) return d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
          if (span < 120 * 86400) return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
          return d.toLocaleDateString(locale, { month: "short", year: "2-digit" });
        },
      },
      localization: { locale, priceFormatter: (p: number) => money(p) },
      handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: false, axisDoubleClickReset: true },
      kineticScroll: { mouse: true, touch: true },
    });

    const series = chart.addSeries(AreaSeries, {
      lineWidth: 3,
      lineType: LineType.Curved,
      priceLineVisible: false,
      lastValueVisible: true,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: cssVar("--bg"),
      crosshairMarkerBorderWidth: 2,
    });
    series.setData(points.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
    chartRef.current = chart;
    seriesRef.current = series;
    markersRef.current = createSeriesMarkers(series, []);

    const report = () => {
      // Never leave blank space after the newest bar.
      if (chart.timeScale().scrollPosition() > 0) chart.timeScale().scrollToPosition(0, false);
      const lr = chart.timeScale().getVisibleRange();
      if (!lr) return;
      const from = lr.from as number;
      const to = lr.to as number;
      spanRef.current = Math.max(1, to - from);
      const intra = spanRef.current < 3 * 86400;
      setIntradayView(intra);
      chart.applyOptions({ timeScale: { timeVisible: intra } });
      const w = windowOf(points, from, to);
      if (w) {
        // Dotted reference at the start of the visible window.
        if (refLineRef.current) series.removePriceLine(refLineRef.current);
        refLineRef.current = series.createPriceLine({ price: w.first.value, color: rgba(neutral, 0.28), lineWidth: 1, lineStyle: LineStyle.Dotted, axisLabelVisible: false, title: "" });
        markersRef.current?.setMarkers(
          w.high.time === w.low.time
            ? []
            : [
                { time: w.high.time as UTCTimestamp, position: "aboveBar" as const, color: textColor, shape: "circle" as const, size: 0, text: money(w.high.value) },
                { time: w.low.time as UTCTimestamp, position: "belowBar" as const, color: textColor, shape: "circle" as const, size: 0, text: money(w.low.value) },
              ].sort((a, b) => (a.time as number) - (b.time as number)),
        );
      }
      visibleCb.current?.(w, userDirty.current);
    };
    // Only pointer/wheel input marks the window as user-chosen; resizes and presets do not.
    const markDirty = () => {
      userDirty.current = true;
    };
    el.addEventListener("pointerdown", markDirty);
    el.addEventListener("wheel", markDirty, { passive: true });
    el.addEventListener("touchstart", markDirty, { passive: true });

    let raf = 0;
    chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(report);
    });

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
      el.removeEventListener("pointerdown", markDirty);
      el.removeEventListener("wheel", markDirty);
      el.removeEventListener("touchstart", markDirty);
      cancelAnimationFrame(raf);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      markersRef.current = null;
      refLineRef.current = null;
      setCursor(null);
      hoverCb.current?.(null);
    };
  }, [points, resolved]);

  // 2. Colour follows the direction of the visible window without rebuilding the chart.
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    const lineColor = cssVar(dir === "down" ? "--down-vivid" : "--up-vivid");
    series.applyOptions({ lineColor, topColor: rgba(lineColor, resolved === "dark" ? 0.32 : 0.26), bottomColor: rgba(lineColor, 0), crosshairMarkerBackgroundColor: lineColor });
  }, [dir, resolved, points]);

  // 3. A preset sets the visible window; the user can then pan/zoom away from it.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !range || points.length === 0) return;
    const slice = sliceRange(points, range);
    userDirty.current = false;
    chart.timeScale().setVisibleRange({ from: slice[0].time as UTCTimestamp, to: slice[slice.length - 1].time as UTCTimestamp });
  }, [range, points, resolved]);

  const preset = range ? sliceRange(points, range) : [];
  const first = preset[0]?.value;
  const last = preset[preset.length - 1]?.value;
  const changePct = first && last !== undefined ? ((last - first) / first) * 100 : 0;
  const activeColor = dir === "down" ? "var(--down)" : "var(--up)";
  const activeBg = dir === "down" ? "var(--down-soft)" : "var(--up-soft)";

  return (
    <div className="chart">
      <div className="chart-canvas" ref={containerRef} style={{ height }} role="img" aria-label={t("chart.aria", { symbol, pct: pct(changePct), label: t(`chart.${range ?? "custom"}`).toLowerCase() })}>
        {cursor && (
          <span className="chart-date num" style={{ left: cursor.x }}>
            {new Date(cursor.time * 1000).toLocaleString(getLocale(), intradayView ? { hour: "numeric", minute: "2-digit" } : { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
        {loading && <span className="chart-loading" aria-hidden="true" />}
        {!loading && points.length === 0 && <p className="chart-empty">{t("chart.empty", { symbol })}</p>}
      </div>
      <div className="chart-foot">
        <div className="tabs chart-ranges" role="group" aria-label={t("chart.rangeGroup")} style={{ ["--tabs-active" as string]: activeColor, ["--tabs-active-bg" as string]: activeBg }}>
          {ranges.map((r) => (
            <button key={r} aria-pressed={range === r} onClick={() => onRangeChange(r)}>
              {r}
            </button>
          ))}
        </div>
        <span className="chart-hint">{t("chart.hint")}</span>
      </div>
    </div>
  );
}
