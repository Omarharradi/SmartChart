import { useState } from "react";

interface SentimentData {
  tweet: string;
  sentiment: "Positive" | "Negative" | "Neutral";
  score: number;
}

const useSentiment = () => {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSentiment = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/sentiment/btc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count: 20 }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sentiment data");
      }

      const data = await response.json();
      
      // 🚨 Ensure sentimentData is properly extracted
      if (data.results && Array.isArray(data.results)) {
        setSentimentData(data.results);
      } else {
        setSentimentData([]); // Ensure no invalid data
      }
    } catch (error) {
      console.error("Error fetching sentiment:", error);
      setSentimentData([]);
    } finally {
      setLoading(false);
    }
  };

  return { sentimentData, loading, fetchSentiment };
};

export default useSentiment;
