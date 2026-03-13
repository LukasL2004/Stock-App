import { useEffect, useRef, useState } from "react";
import { createChart, AreaSeries, CrosshairMode } from "lightweight-charts";
import type { UTCTimestamp, LineData } from "lightweight-charts";
import "./Charts.css";
import StockData from "../../Services/StockInfoService";
import type { Chart as ChartData } from "../../Services/Interfaces/StockInfoInterface";

interface ChartProps {
  name: string;
}

type TimeRange = "1M" | "3M" | "6M" | "1Y";

export default function Charts({ name }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<ChartData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("1M");

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await StockData.chartData();
        setData(response);
      } catch (error) {
        console.error(error);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      height: 350,
      autoSize: true,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#333",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: {
          visible: true,
          color: "#e1e5ec",
          style: 3,
        },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          visible: false,
          labelVisible: false,
        },
        horzLine: {
          visible: false,
          labelVisible: false,
        },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
        secondsVisible: false,
        rightBarStaysOnScroll: false,
        barSpacing: 25,
        tickMarkFormatter: () => "",
      },
      leftPriceScale: {
        visible: true,
        borderVisible: false,
      },
      rightPriceScale: {
        visible: false,
      },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: "#2962FF",
      topColor: "rgba(41, 98, 255, 0.2)",
      bottomColor: "rgba(41, 98, 255, 0)",
      lineWidth: 2,
    });

    const formattedData = data
      .filter((item) => item.symbol === name)
      .map((item) => ({
        time: Math.floor(
          new Date(`${item.date}T${item.time}`).getTime() / 1000,
        ) as UTCTimestamp,
        value: item.value,
      }))
      .sort((a, b) => a.time - b.time);

    if (formattedData.length > 0) {
      const latestTime = formattedData[formattedData.length - 1].time;
      const latestDate = new Date(latestTime * 1000);
      const cutoffDate = new Date(latestDate);

      if (timeRange === "1M") cutoffDate.setMonth(cutoffDate.getMonth() - 1);
      else if (timeRange === "3M")
        cutoffDate.setMonth(cutoffDate.getMonth() - 3);
      else if (timeRange === "6M")
        cutoffDate.setMonth(cutoffDate.getMonth() - 6);
      else if (timeRange === "1Y")
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

      const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);
      const filteredData = formattedData.filter(
        (d) => d.time >= cutoffTimestamp,
      );

      areaSeries.setData(
        filteredData.length > 0 ? filteredData : formattedData,
      );

      if (filteredData.length > 0) {
        chart.timeScale().setVisibleRange({
          from: filteredData[0].time,
          to: filteredData[filteredData.length - 1].time,
        });
      }
    }

    chart.subscribeCrosshairMove((param) => {
      const tooltip = tooltipRef.current;
      const container = chartContainerRef.current;

      if (!tooltip || !container) return;

      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
      ) {
        tooltip.style.display = "none";
        return;
      }

      const dateStr = new Date((param.time as number) * 1000).toLocaleString(
        "en-US",
        { year: "numeric", month: "short", day: "numeric" },
      );

      const priceData = param.seriesData.get(areaSeries) as
        | LineData
        | undefined;
      const priceVal = priceData?.value;

      if (priceVal !== undefined) {
        tooltip.style.display = "block";
        tooltip.innerHTML = `
          <div class="tooltip-date">${dateStr}</div>
          <div class="tooltip-price">$${priceVal.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}</div>
        `;

        const tooltipWidth = 120;
        const tooltipHeight = 60;
        const margin = 15;

        let left = param.point.x + margin;
        if (left + tooltipWidth > container.clientWidth) {
          left = param.point.x - tooltipWidth - margin;
        }

        let top = param.point.y - tooltipHeight - margin;
        if (top < 0) {
          top = param.point.y + margin;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, name, timeRange]);

  return (
    <div className="growth-history-wrapper">
      <div className="growth-history-header">
        <div className="growth-history-title-group">
          <h2>Growth History</h2>
          <p>Portfolio performance over time</p>
        </div>
        <div className="growth-history-filters">
          {(["1M", "3M", "6M", "1Y"] as TimeRange[]).map((range) => (
            <button
              key={range}
              className={`filter-btn ${timeRange === range ? "active" : ""}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="chartMain" ref={chartContainerRef}>
        <div className="custom-tooltip" ref={tooltipRef}></div>
      </div>
    </div>
  );
}
