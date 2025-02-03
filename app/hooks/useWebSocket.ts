import { useEffect, useState } from "react";
import { PriceData } from "../types";

const BIN_SIZE = 100; // Adjust this value to change price range per bin

const useWebSocket = (url: string) => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [volumeBins, setVolumeBins] = useState<{ [price: number]: { bid: number; ask: number } }>({});

  useEffect(() => {
    const socketInstance = new WebSocket(url);

    socketInstance.onopen = () => {
      console.log("WebSocket connected");
      const message = {
        type: "subscribe",
        product_ids: ["BTC-USD"],
        channels: [
          "level2",
          "heartbeat",
          {
            name: "ticker",
            product_ids: ["BTC-USD"],
          },
        ],
      };
      socketInstance.send(JSON.stringify(message));
    };

    socketInstance.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);

      if (receivedData.type === "ticker" && receivedData.price) {
        const newPrice = parseFloat(receivedData.price);
        const timestamp = Date.now();
        const tradeSize = parseFloat(receivedData.last_size ?? "0");

        // 1️⃣ Determine the bin for the current price
        const bin = Math.floor(newPrice / BIN_SIZE) * BIN_SIZE;

        // 2️⃣ Accumulate bid & ask volume per price bin
        const bidSize = parseFloat(receivedData.total_bid_size ?? "0");
        const askSize = parseFloat(receivedData.total_ask_size ?? "0");

        setVolumeBins((prevBins) => ({
          ...prevBins,
          [bin]: {
            bid: (prevBins[bin]?.bid || 0) + bidSize,
            ask: (prevBins[bin]?.ask || 0) + askSize,
          },
        }));

        // 3️⃣ Update price data for candles
        setCurrentPrice(newPrice);
        setPriceData((prevData) => {
          if (prevData.length === 0) {
            return [
              {
                timestamp,
                open: newPrice,
                high: newPrice,
                low: newPrice,
                close: newPrice,
                last_size: tradeSize,
              },
            ];
          }

          const lastCandle = prevData[prevData.length - 1];
          const newMinute = Math.floor(timestamp / 60000);
          const lastMinute = Math.floor(lastCandle.timestamp / 60000);

          if (newMinute !== lastMinute) {
            return [
              ...prevData,
              {
                timestamp,
                open: newPrice,
                high: newPrice,
                low: newPrice,
                close: newPrice,
                last_size: tradeSize,
              },
            ];
          } else {
            const updatedData = [...prevData];
            updatedData[updatedData.length - 1] = {
              ...lastCandle,
              high: Math.max(lastCandle.high, newPrice),
              low: Math.min(lastCandle.low, newPrice),
              close: newPrice,
              last_size: lastCandle.last_size + tradeSize,
            };
            return updatedData;
          }
        });
      }
    };

    return () => {
      socketInstance.close();
    };
  }, [url]);

  return { priceData, currentPrice, volumeBins };
};

export default useWebSocket;
