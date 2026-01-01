import { useEffect, useRef, useState } from "react";
import { createChart, LineSeries } from "lightweight-charts";
import type { UTCTimestamp } from "lightweight-charts";

import StockData from "../../Services/StockInfoService";
import type { Chart } from "../../Services/Interfaces/StockInfoInterface";

interface ChartProps {
  name: string;
}

export default function Charts({ name }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<Chart[]>([]);
  const stockName = name;

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
      width: 800,
      height: 400,

      layout: {
        background: { color: "#000" },
        textColor: "#fff",
      },

      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },

      timeScale: {
        borderVisible: false,
        timeVisible: false,
        secondsVisible: false,
        rightBarStaysOnScroll: false,
        barSpacing: 25,
        tickMarkFormatter: (time: string) => {
          if (typeof time === "number") {
            return new Date(time * 1000).toISOString().split("T")[0];
          }
          return "";
        },
      },

      localization: {
        timeFormatter: (time: string) => {
          if (typeof time === "number") {
            const d = new Date(time * 1000);
            return d.toLocaleString("en-GB", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            });
          }
          return "";
        },
      },
    });

    const lineSeries = chart.addSeries(LineSeries, {
      lineWidth: 2,
    });

    const symbol = stockName;

    const formattedData = data
      .filter((item) => item.symbol === symbol)
      .map((item) => {
        const timestamp = Math.floor(
          new Date(`${item.date}T${item.time}`).getTime() / 1000
        ) as UTCTimestamp;

        return {
          time: timestamp,
          value: item.value,
        };
      })
      .sort((a, b) => a.time - b.time);

    lineSeries.setData(formattedData);

    chart.timeScale().setVisibleRange({
      from: formattedData[0].time,
      to: formattedData[formattedData.length - 1].time,
    });

    return () => chart.remove();
  }, [data, stockName]);

  return <div ref={chartContainerRef} />;
}
