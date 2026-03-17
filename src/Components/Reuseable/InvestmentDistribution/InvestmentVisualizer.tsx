import { useEffect, useState } from "react";
import "./InvestmentVisualizer.css";
import type { total } from "../../../Services/Interfaces/TotalInterface";
import Portofolio from "../../../Services/PortofolioService";

const CHART_COLORS = [
  "#1a73e8",
  "#669df6",
  "#aecbfa",
  "#e8eaed",
  "#f1f3f4",
  "#dadce0",
];

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  symbol: string;
  percentage: number;
}

export default function InvestmentVisualizer() {
  const [stocks, setStocks] = useState<total>();
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    symbol: "",
    percentage: 0,
  });

  const stockCall = async () => {
    const response = await Portofolio.getTotal();
    setStocks(response);
  };

  useEffect(() => {
    setTimeout(() => {
      stockCall();
    }, 0);
  }, []);

  const allStocks = stocks?.portfolioChart
    ? [...stocks.portfolioChart].sort((a, b) => b.value - a.value)
    : [];

  const top4Stocks = allStocks.slice(0, 4);

  const generateConicGradient = () => {
    if (!allStocks.length) return "transparent";
    let cumulative = 0;
    const stops = allStocks.map((stock, index) => {
      const start = cumulative;
      cumulative += stock.percentage;
      return `${CHART_COLORS[index % CHART_COLORS.length]} ${start}% ${cumulative}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!allStocks.length) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const distanceFromCenter = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
    );
    if (distanceFromCenter < 60) {
      setTooltip((prev) => ({ ...prev, visible: false }));
      return;
    }

    let angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
    angle += 90;
    if (angle < 0) angle += 360;

    const hoveredPercent = (angle / 360) * 100;

    let cumulative = 0;
    let foundStock = allStocks[allStocks.length - 1];

    for (let i = 0; i < allStocks.length; i++) {
      cumulative += allStocks[i].percentage;
      if (hoveredPercent <= cumulative) {
        foundStock = allStocks[i];
        break;
      }
    }

    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      symbol: foundStock.symbol,
      percentage: foundStock.percentage,
    });
  };

  return (
    <div className="investmentMain">
      <h3 className="componentTitle">Investment Distribution</h3>

      <div className="investmentMainContainer">
        <div className="chartSection">
          <div
            className="donutChart"
            style={{ background: generateConicGradient() }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() =>
              setTooltip((prev) => ({ ...prev, visible: false }))
            }
          >
            <div className="innerCircle">
              <p className="statusSubtitle">DIVERSITY</p>
              <h2>High</h2>
            </div>
          </div>
        </div>

        <div className="listSection">
          {top4Stocks.map((stock, index) => (
            <div key={index} className="stockListItem">
              <div className="stockLeftInfo">
                <span
                  className="colorDot"
                  style={{
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                ></span>
                <div className="stockNames">
                  <p className="symbol">{stock.symbol}</p>
                  <p className="companyName">Company Name</p>
                </div>
              </div>

              <div className="stockRightInfo">
                <p className="percentage">{Math.round(stock.percentage)}%</p>
                <p className="stockSum">${stock.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {tooltip.visible && (
        <div
          className="chartTooltip"
          style={{
            left: tooltip.x + 15,
            top: tooltip.y + 15,
          }}
        >
          <strong>{tooltip.symbol}</strong>: {Math.round(tooltip.percentage)}%
        </div>
      )}
    </div>
  );
}
