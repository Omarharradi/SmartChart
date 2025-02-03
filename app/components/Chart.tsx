"use client";

import React, { useRef, useEffect } from "react";
import useChart from "../hooks/useChart";
import useUpdateSeries from "../hooks/useUpdateSeries";
import useVolume from "../hooks/useVolume";
import { PriceData, MovingAverageData, VolumeData } from "../types";
import { IChartApi } from "lightweight-charts";


interface ChartComponentProps {
  priceData: PriceData[];
  movingAverageData: MovingAverageData[];
  currentPrice?: number;
  volumeBins: Record<number, { bid: number; ask: number }>;
}

const ChartComponent: React.FC<ChartComponentProps> = ({
  priceData,
  movingAverageData,
  currentPrice,
  volumeBins,
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const volumeProfileCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);

  const {
    chartInstance,
    candlestickSeries,
    movingAverageSeries,
    volumeSeries,
  } = useChart(chartContainerRef as React.RefObject<HTMLDivElement>);

  useEffect(() => {
    if (!chartContainerRef.current) {
      console.error("Chart container not found.");
      return;
    }
  }, []);

  useEffect(() => {
    if (!chartInstance.current) {
      console.error("Chart instance is not initializing.");
      return;
    }
    chartInstanceRef.current = chartInstance.current;
  }, [chartInstance]);

  useEffect(() => {
    if (!chartInstance.current) return;

    chartInstance.current.priceScale("right").applyOptions({
      scaleMargins: {
        top: 0.05,
        bottom: 0.2,
      },
    });

    chartInstance.current.priceScale("volume").applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
      borderVisible: false,
    });

    // ✅ Configure left-side price scale for volume profile bars
    chartInstance.current.priceScale("left").applyOptions({
      position: "left",
      borderVisible: false,
      autoScale: false,
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    });
  }, [chartInstance]);

  const volumeData: VolumeData[] = useVolume(priceData);

  // Get volume profile levels & volume data
  const { volumeProfileLevels } = useUpdateSeries(
    candlestickSeries.current,
    movingAverageSeries.current,
    volumeSeries.current,
    priceData,
    movingAverageData,
    volumeData,
    null,
    volumeBins
  );

  // Compute max volume for normalization
  const maxVolume = Math.max(...Object.values(volumeBins).map(bin => bin.bid + bin.ask), 1);

  // ✅ Draw Volume Profile as Horizontal Bars using Canvas Overlay
  useEffect(() => {
    if (!chartInstanceRef.current || volumeProfileLevels.length === 0) return;

    const canvas = volumeProfileCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to match chart
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height); // Clear old drawings

    volumeProfileLevels.forEach((price) => {
      const volume = volumeBins[price]?.bid + volumeBins[price]?.ask || 0;
      const barWidth = (volume / maxVolume) * (width * 0.2); // Bars take 20% of chart width

      // Convert price to Y-coordinate
      const priceScale = chartInstanceRef.current?.priceScale("right");
      const y = priceScale?.priceToCoordinate(price);
      if (!y) return;

      // Draw bars on the left
      ctx.fillStyle = "rgba(255, 165, 0, 0.6)";
      ctx.fillRect(0, y - 2, barWidth, 4);
    });

    console.log("📊 Volume Profile Rendered!");
  }, [volumeProfileLevels, volumeBins, maxVolume]);

  // ✅ Resize canvas when the window resizes
  useEffect(() => {
    function resizeCanvas() {
      if (!chartContainerRef.current || !volumeProfileCanvasRef.current) return;

      const canvas = volumeProfileCanvasRef.current;
      const chartElement = chartContainerRef.current;
      canvas.width = chartElement.clientWidth;
      canvas.height = chartElement.clientHeight;
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <div className="chart-wrapper" style={{ width: "100%", height: "500px", position: "relative" }}>
      {/* Canvas for volume profile bars */}
      <canvas
        ref={volumeProfileCanvasRef}
        style={{
          position: "absolute",
          left: "0",
          top: "0",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      {/* Lightweight Charts container */}
      <div
        className="chart-content"
        ref={chartContainerRef}
        style={{ width: "100%", height: "100%", backgroundColor: "#1e1e1e", zIndex: 2 }}
      />
    </div>
  );
};

export default ChartComponent;

