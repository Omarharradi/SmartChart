"use client";

import useWebSocket from "./hooks/useWebSocket";
import useMovingAverage from "./hooks/useMovingAverage";
import useVolume from "./hooks/useVolume";
import ChartComponent from "./components/Chart";
import Chat from "./components/Chat";
import Sentiment from "./components/Sentiment"; // Import the Sentiment component
import { Time } from "lightweight-charts";
import "./Chat.css";
import React from "react";

const Page = () => {
  const { priceData, currentPrice, volumeBins } = useWebSocket("wss://ws-feed.exchange.coinbase.com");
  const movingAverageData = useMovingAverage(priceData, 5);
  const volumeData = useVolume(priceData);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Smart Chart</h1>
      </header>

      {/* Chat on Left */}
      <Chat
        currentPrice={currentPrice}
        priceData={priceData.map(data => ({ ...data, time: data.timestamp as Time }))}
        movingAverageData={movingAverageData}
        volumeData={volumeData}
      />

      {/* Chart Section */}
      <div className="chart-container">
        {currentPrice ? (
          <p>Current Price: ${currentPrice.toFixed(2)}</p>
        ) : (
          <p>Loading price...</p>
        )}
        <ChartComponent
          priceData={priceData}
          movingAverageData={movingAverageData}
          currentPrice={currentPrice}
          volumeBins={volumeBins}
           // Pass volumeBins to ChartComponent
        />

        {/* Sentiment Analysis Section */}
        <Sentiment />
      </div>
    </div>
  );
};

export default Page;
