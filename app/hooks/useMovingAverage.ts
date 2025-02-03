// app/hooks/useMovingAverage.ts

import { useEffect, useState } from "react";
import { PriceData, MovingAverageData } from "../types";

const useMovingAverage = (priceData: PriceData[], period: number) => {
  const [movingAverageData, setMovingAverageData] = useState<MovingAverageData[]>([]);

  useEffect(() => {
    if (priceData.length >= period) {
      // Aggregate priceData into minute-based candlesticks
      const aggregatedMap = new Map<number, PriceData>();

      priceData.forEach((data) => {
        const minuteTimestamp = Math.floor((data.timestamp / 1000) / 60) * 60;
        if (!aggregatedMap.has(minuteTimestamp)) {
          aggregatedMap.set(minuteTimestamp, { ...data, timestamp: minuteTimestamp * 1000 });
        } else {
          const existing = aggregatedMap.get(minuteTimestamp)!;
          aggregatedMap.set(minuteTimestamp, {
            timestamp: minuteTimestamp * 1000,
            open: existing.open,
            high: Math.max(existing.high, data.high),
            low: Math.min(existing.low, data.low),
            close: data.close, // Last close price for the minute
            last_size: data.last_size,
          });
        }
      });

      const aggregatedCandles = Array.from(aggregatedMap.values());

      // Calculate moving average for aggregated data
      const movingAverage: MovingAverageData[] = [];
      for (let i = period - 1; i < aggregatedCandles.length; i++) {
        const slice = aggregatedCandles.slice(i - period + 1, i + 1);
        const average = slice.reduce((sum, candle) => sum + candle.close, 0) / period;

        movingAverage.push({
          time: Math.floor(aggregatedCandles[i].timestamp / 1000), // Convert to seconds
          value: average,
        });
      }

      console.log("Calculated Moving Average Data:", movingAverage); // Debugging
      setMovingAverageData(movingAverage);
    }
  }, [priceData, period]);

  return movingAverageData;
};

export default useMovingAverage;