"use client";

import React, { useState, useRef, useEffect } from "react";
import "../Chat.css";
import { CandlestickData, LineData, HistogramData } from "lightweight-charts";

interface ChatProps {
  currentPrice?: number;
  priceData: CandlestickData[];
  movingAverageData: LineData[];
  volumeData: HistogramData[];
}

const Chat: React.FC<ChatProps> = ({
  currentPrice,
  priceData = [],
  movingAverageData = [],
  volumeData = [],
}) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const handleClearChat = () => {
    setMessages([]);
  };

const minPrice = Math.min(...priceData.slice(-15).map((c) => c.close));
const maxPrice = Math.max(...priceData.slice(-15).map((c) => c.close));
const avgPrice = priceData.slice(-15).reduce((sum, c) => sum + c.close, 0) / priceData.slice(-15).length;

const volatility = ((maxPrice - minPrice) / avgPrice) * 100; // ✅ Now it works correctly


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setInput("");
    setLoading(true);

    const prompt = `
    You are a professional crypto analyst, delivering precise, no-nonsense insights on the BTC-USD trading pair. Always provide an answer with strong reasoning and a confident tone. Keep it brief but impactful.

### **Latest Market Data**:
- **Current Time**: ${priceData.slice(-15).map((candle) => candle.time).join(", ")}
- **Current Price**: ${currentPrice?.toFixed(2) ?? "N/A"}
- **Recent Closings (Last 15)**: ${priceData.slice(-15).map((candle) => candle.close).join(", ")}
- **Moving Averages (Last 15)**: ${movingAverageData.slice(-15).map((ma) => ma.value).join(", ")}
- **Trading Volumes (Last 15)**: ${volumeData.slice(-15).map((vol) => vol.value).join(", ")}
- **Min**: ${Math.min(...priceData.slice(-15).map((c) => c.close))}
- **Max**: ${Math.max(...priceData.slice(-15).map((c) => c.close))}
- **Volatility (Last 15 Candles)**: ${volatility.toFixed(2)}%

the data is 1M candles, take it into account. do not always advice to sell. and instead of saying Hold, say wait. If you are bullish, say buy, if you are bearish, say sell, or say that for a future price if it breaks or test it.

### **Objective**:
Your task is to analyze the latest BTC-USD market trends based on price movements, moving averages, and support/resistance levels. Provide an **accurate** yet **concise** response to the following question, ensuring it is **direct, professional, and actionable**.

**User's Question**: "${input}"

### **Rules**:
- **No vague answers**: Always provide a firm opinion, whether bullish, bearish, or neutral.
- **No disclaimers**: Do not say "I need more information" or "I cannot provide financial advice."
- **Use price action**: Mention if BTC is testing support, breaking resistance, or consolidating.
- **Actionable insights**: If there's a clear trend, suggest potential implications (e.g., "BTC is showing strong momentum above resistance; watch for a breakout").

    `;

    try {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=API_KEY", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
      setResponse(botResponse);
      setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);

    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { text: "Error connecting to LLM server.", sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">Trading Chat Assistant</h2>
      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.sender === "user" ? "chat-user" : "chat-bot"}`}>
              {msg.text}
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Bitcoin..."
          className="chat-input"
          required
        />
        <button type="button" className="clear-chat-button" onClick={handleClearChat}>
  Clear
</button>

        <button type="submit" className="chat-button">Send</button>
      </form>
    </div>
  );
};

export default Chat;
