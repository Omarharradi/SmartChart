import { useRef, useEffect } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  IPriceLine,
} from "lightweight-charts";

export const useChart = (
  containerRef: React.RefObject<HTMLDivElement>
) => {
  const chartInstance = useRef<IChartApi | null>(null);
  const candlestickSeries = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const movingAverageSeries = useRef<ISeriesApi<"Line"> | null>(null);
  const volumeSeries = useRef<ISeriesApi<"Histogram"> | null>(null);
  const volumeProfileSeries = useRef<ISeriesApi<"Line"> | null>(null); // Use LineSeries for volume profile
  const priceLineRef = useRef<IPriceLine | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create chart instance
    chartInstance.current = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#1e1e1e" },
        textColor: "#ffffff",
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });

    // Add candlestick series (on default scale)
    candlestickSeries.current = chartInstance.current.addCandlestickSeries();

    // Add moving average line series
    movingAverageSeries.current = chartInstance.current.addLineSeries({
      color: "blue",
    });

    // Add volume series
    volumeSeries.current = chartInstance.current.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume", // Volume scale for volume series
    });

    

    // Adjust price scales for the main chart
    chartInstance.current.priceScale("right").applyOptions({
      scaleMargins: {
        top: 0.05,
        bottom: 0.2, // Space for volume
      },
    });

    // Cleanup chart instance
    return () => {
      chartInstance.current?.remove();
      chartInstance.current = null;
    };
  }, [containerRef]);

  return {
    chartInstance,
    candlestickSeries,
    movingAverageSeries,
    volumeSeries,
    priceLineRef,
  };
};

export default useChart;