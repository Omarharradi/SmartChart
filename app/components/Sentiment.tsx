import React, { useEffect } from "react";
import useSentiment from "../hooks/useSentiment";

const Sentiment: React.FC = () => {
  const { sentimentData, loading, fetchSentiment } = useSentiment();

  // Fetch sentiment on component mount
  useEffect(() => {
    fetchSentiment();
  }, []);

  // 🚀 Ensure scores are correctly processed
  const scores = sentimentData.map((item) => item.score);
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const avgScore = scores.length > 0 ? totalScore / scores.length : 0;

  // Convert to percentage (0% = fully negative, 100% = fully positive)
  const sentimentPercentage = (avgScore + 1) * 50; // Scales -1 to 1 into a 0-100% range

  // 🔥 Dynamic Bar Color
  const getBarColor = (score: number) => {
    if (score > 0.5) return "linear-gradient(90deg, #4CAF50, #1B5E20)"; // Strong Green
    if (score > 0.2) return "linear-gradient(90deg, #66BB6A, #2E7D32)"; // Soft Green
    if (score > -0.2) return "linear-gradient(90deg, #FFC107, #FF9800)"; // Neutral Yellow
    if (score > -0.5) return "linear-gradient(90deg, #FF7043, #D84315)"; // Light Red
    return "linear-gradient(90deg, #F44336, #B71C1C)"; // Strong Red
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>📊 Market Sentiment</h3>

      <button onClick={fetchSentiment} style={buttonStyle} disabled={loading}>
        {loading ? "Analyzing..." : "🔄 Refresh Sentiment"}
      </button>

      {/* Sentiment Bar */}
      <div style={barContainerStyle}>
        <div style={barWrapperStyle}>
          <div
            style={{
              ...progressStyle,
              width: `${sentimentPercentage}%`,
              background: getBarColor(avgScore),
            }}
          >
            <span style={scoreTextStyle}>{avgScore.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  padding: "1.5rem",
  borderRadius: "10px",
  maxWidth: "800px",
  margin: "2rem auto",
  backgroundColor: "#121212",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.4)",
  fontFamily: "Arial, sans-serif",
  color: "#fff",
  textAlign: "center",
};

const titleStyle: React.CSSProperties = {
  marginBottom: "1.2rem",
  fontSize: "1.5rem",
  fontWeight: "bold",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.6rem 1.5rem",
  fontSize: "0.9rem",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#4CAF50",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "background-color 0.3s ease",
  marginBottom: "1.5rem",
};

const barContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "1rem",
};

const labelStyle: React.CSSProperties = {
  flex: "0 0 50px",
  textAlign: "center",
  fontSize: "1.2rem",
};

const barWrapperStyle: React.CSSProperties = {
  flex: "1",
  height: "35px",
  backgroundColor: "#222",
  borderRadius: "20px",
  overflow: "hidden",
  margin: "0 15px",
  display: "flex",
  alignItems: "center",
  border: "1px solid #444",
  position: "relative",
};



const progressStyle: React.CSSProperties = {
  height: "100%",
  borderRadius: "20px",
  transition: "width 0.4s ease-in-out",
  position: "relative",
  display: "flex",
  alignItems: "center",
};



const scoreTextStyle: React.CSSProperties = {
  position: "absolute",
  right: "12px",
  fontSize: "1rem",
  color: "#fff",
  fontWeight: 700,
};

export default Sentiment;
