import { useEffect, useMemo, useState } from "react";
import {
  ISeriesApi,
  LineData,
  CandlestickData,
  HistogramData,
} from "lightweight-charts";
import { PriceData, MovingAverageData, VolumeData } from "../types";
import { Time } from "lightweight-charts";

const useUpdateSeries = (
  candlestickSeries: ISeriesApi<"Candlestick"> | null,
  movingAverageSeries: ISeriesApi<"Line"> | null,
  volumeSeries: ISeriesApi<"Histogram"> | null,
  priceData: PriceData[],
  movingAverageData: MovingAverageData[],
  volumeData: VolumeData[],
  volumeProfileSeries: ISeriesApi<"Histogram"> | null,
  volumeBins: Record<number, { bid: number; ask: number }>
) => {
  const [volumeProfileLevels, setVolumeProfileLevels] = useState<number[]>([]);

  // Aggregate priceData into minute-based candlesticks
  const aggregatedCandles = useMemo(() => {
    if (priceData.length === 0) return [];

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
          close: data.close,
          last_size: data.last_size,
        });
      }
    });

    return Array.from(aggregatedMap.values()).map((data) => ({
      time: (data.timestamp / 1000) as Time,
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
    }));
  }, [priceData]);

  // Update candlestick series
  useEffect(() => {
    if (!candlestickSeries || aggregatedCandles.length === 0) return;
    candlestickSeries.setData(aggregatedCandles);
  }, [candlestickSeries, aggregatedCandles]);

  // Update moving average series
  useEffect(() => {
    if (!movingAverageSeries || movingAverageData.length === 0) return;

    const formattedMovingAverage: LineData[] = movingAverageData.map((ma) => ({
      time: ma.time as Time,
      value: ma.value,
    }));

    movingAverageSeries.setData(formattedMovingAverage);
  }, [movingAverageSeries, movingAverageData]);

  // Update volume histogram
  useEffect(() => {
    if (!volumeSeries || volumeData.length === 0) return;

    const formattedVolume = volumeData.map((vol) => {
      const candle = priceData.find((c) => Math.floor((c.timestamp / 1000) / 60) * 60 === vol.time);

      let barColor = "rgba(76,175,80,0.5)"; // Green
      if (candle && candle.close < candle.open) {
        barColor = "rgba(239,83,80,0.5)"; // Red
      }
      return { time: vol.time as Time, value: vol.value, color: barColor };
    });

    volumeSeries.setData(formattedVolume);
  }, [volumeSeries, volumeData, priceData]);


  // Update volume profile histogram series and extract price levels
  useEffect(() => {
    if (!volumeProfileSeries || !volumeBins) return;

    const lastCandleTime = aggregatedCandles.length > 0 ? aggregatedCandles[aggregatedCandles.length - 1].time : Date.now() / 1000;

    const volumeProfileData = Object.keys(volumeBins).map((price, index) => ({
      time: parseFloat(price), // ✅ Set time as the price level
      value: volumeBins[parseFloat(price)].bid + volumeBins[parseFloat(price)].ask,
      color: "rgba(33, 150, 243, 0.5)",
    }));
    console.log("📊 Volume Profile Data:", volumeProfileData);

    volumeProfileSeries.setData(volumeProfileData);

    // Extract price levels for horizontal lines
    setVolumeProfileLevels(Object.keys(volumeBins).map((price) => parseFloat(price)));
  }, [volumeProfileSeries, volumeBins, aggregatedCandles]);

  return { volumeProfileLevels };
};

export default useUpdateSeries;