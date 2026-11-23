import { useEffect, useRef, useState } from "react";
import { createChart, createSeriesMarkers, AreaSeries, CrosshairMode, LineStyle, LineType, type UTCTimestamp } from "lightweight-charts";
import "./Charts.css";
import { cssVar, useTheme } from "../../lib/useTheme";
import { money, pct } from "../../lib/format";
import type { Point, Range } from "./ranges";
import { useI18n } from "../../i18n/useI18n";
import { getLocale } from "../../i18n/core";
export type { Point, Range } from "./ranges";

function rgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

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

/**
 * Smoothed area chart in the brokerage style: gradient under the line, quiet price and time axes,
 * high/low callouts, a dotted line at the range start, and a crosshair that reports the hovered point.
 */
export default function Charts({ symbol, data, loading, dir, range, ranges, onRangeChange, onHover, height = 360 }: Props) {
  const { t } = useI18n();
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
    const dark = resolved === "dark";
    const textColor = cssVar("--text-3");
    const gridColor = rgba(dark ? "#ffffff" : "#000000", dark ? 0.07 : 0.06);
    const locale = getLocale();
    const intraday = range === "1D";

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { color: "transparent" },
        textColor,
        fontSize: 11,
        fontFamily: cssVar("--font-sans") || undefined,
        attributionLogo: false,
      },
      grid: { vertLines: { visible: false }, horzLines: { color: gridColor, style: LineStyle.Solid } },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: { color: rgba(dark ? "#ffffff" : "#000000", 0.35), width: 1, style: LineStyle.Solid, labelVisible: false },
        horzLine: { color: rgba(dark ? "#ffffff" : "#000000", 0.25), width: 1, style: LineStyle.Dashed, labelVisible: true, labelBackgroundColor: cssVar("--cta") },
      },
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: { top: 0.14, bottom: 0.06 },
        entireTextOnly: true,
        ticksVisible: false,
      },
      leftPriceScale: { visible: false },
      timeScale: {
        visible: true,
        borderVisible: false,
        timeVisible: intraday,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightOffset: 0,
        tickMarkFormatter: (time: number) => {
          const d = new Date(time * 1000);
          if (intraday) return d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
          if (range === "1W" || range === "1M") return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
          if (range === "ALL" || range === "1Y") return d.toLocaleDateString(locale, { month: "short", year: "2-digit" });
          return d.toLocaleDateString(locale, { month: "short", day: "numeric" });
        },
      },
      localization: { locale, priceFormatter: (p: number) => money(p) },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor,
      lineWidth: 3,
      lineType: LineType.Curved,
      topColor: rgba(lineColor, dark ? 0.32 : 0.26),
      bottomColor: rgba(lineColor, 0),
      priceLineVisible: false,
      lastValueVisible: true,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: cssVar("--bg"),
      crosshairMarkerBackgroundColor: lineColor,
      crosshairMarkerBorderWidth: 2,
    });
    series.setData(data.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));

    // Reference line at the start of the range: everything above it is a gain.
    series.createPriceLine({ price: data[0].value, color: rgba(dark ? "#ffffff" : "#000000", 0.28), lineWidth: 1, lineStyle: LineStyle.Dotted, axisLabelVisible: false, title: "" });

    // High and low callouts for the visible range.
    let hi = data[0];
    let lo = data[0];
    for (const p of data) {
      if (p.value > hi.value) hi = p;
      if (p.value < lo.value) lo = p;
    }
    if (hi.time !== lo.time) {
      const markers = [
        { time: hi.time as UTCTimestamp, position: "aboveBar" as const, color: textColor, shape: "circle" as const, size: 0, text: money(hi.value) },
        { time: lo.time as UTCTimestamp, position: "belowBar" as const, color: textColor, shape: "circle" as const, size: 0, text: money(lo.value) },
      ].sort((a, b) => (a.time as number) - (b.time as number));
      createSeriesMarkers(series, markers);
    }

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
  }, [data, dir, resolved, range]);

  const first = data[0]?.value;
  const last = data[data.length - 1]?.value;
  const changePct = first && last !== undefined ? ((last - first) / first) * 100 : 0;
  const activeColor = dir === "down" ? "var(--down)" : "var(--up)";
  const activeBg = dir === "down" ? "var(--down-soft)" : "var(--up-soft)";

  return (
    <div className="chart">
      <div className="chart-canvas" ref={containerRef} style={{ height }} role="img" aria-label={t("chart.aria", { symbol, pct: pct(changePct), label: t(`chart.${range}`).toLowerCase() })}>
        {cursor && (
          <span className="chart-date num" style={{ left: cursor.x }}>
            {new Date(cursor.time * 1000).toLocaleString(getLocale(), range === "1D" ? { hour: "numeric", minute: "2-digit" } : { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
        {loading && <span className="chart-loading" aria-hidden="true" />}
        {!loading && data.length === 0 && <p className="chart-empty">{t("chart.empty", { symbol })}</p>}
      </div>
      <div className="tabs chart-ranges" role="group" aria-label={t("chart.rangeGroup")} style={{ ["--tabs-active" as string]: activeColor, ["--tabs-active-bg" as string]: activeBg }}>
        {ranges.map((r) => (
          <button key={r} aria-pressed={range === r} onClick={() => onRangeChange(r)}>
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
