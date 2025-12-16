import { useEffect, useState } from "react";
import type { Stock } from "../../Services/Interfaces/StockInfoInterface";
import StockData from "../../Services/StockInfoService";
import "./LandingPage.css";

export default function LandingPage() {
  const symbols = [
    "AAPL:NASDAQ",
    "TSLA:NASDAQ",
    "NVDA:NASDAQ",
    "AMZN:NASDAQ",
    "MSFT:NASDAQ",
    "META:NASDAQ",
    "GOOGL:NASDAQ",
    "ORCL:NYSE",
  ];

  type CandlesMap = Record<string, Stock>;
  const [candles, setCandles] = useState<CandlesMap>({});

  const getData = async () => {
    try {
      const response = await Promise.all(
        symbols.map(async (Symbol) => {
          const candle = await StockData.CandlesData(Symbol);
          return { Symbol, candle };
        })
      );

      const candlesMap: CandlesMap = {};
      response.forEach(({ Symbol, candle }) => {
        candlesMap[Symbol] = candle;
      });

      setCandles(candlesMap);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getData();
    };

    fetchData();
  }, []);
  return (
    <div>
      <h2>Stocks (5 min candles)</h2>

      {symbols.map((symbol) => (
        <div key={symbol}>
          <strong>{symbol}</strong>
          {candles[symbol] ? (
            <p>Close: {candles[symbol].close}</p>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      ))}
    </div>
  );
}
