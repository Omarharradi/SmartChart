import tweepy
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import uvicorn

# Initialize FastAPI
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Twitter API Credentials (Use API v2 Keys)
BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAAdoygEAAAAASWfB%2Beowc7IYEn89TRopt2Y11kQ%3DG2tyRFmHykS3oYripH8Lmoyo4HZH2n9HaM4ajFaWvk6SJ2iba4"

# Initialize Tweepy for API v2
client = tweepy.Client(bearer_token=BEARER_TOKEN)

# Initialize Sentiment Analyzer
analyzer = SentimentIntensityAnalyzer()

# BTC Keywords for Filtering
BTC_KEYWORDS = ["bitcoin", "btc", "#bitcoin", "#btc", "Bitcoin", "BTC"]

# Define Input Schema
class SentimentRequest(BaseModel):
    query: str = "bitcoin"
    count: int = 10  # Number of tweets to fetch

# API Endpoint to Get BTC Sentiment
@app.post("/sentiment/btc")
async def get_btc_sentiment(request: SentimentRequest):
    query = " OR ".join(BTC_KEYWORDS)

    try:
        tweets = client.search_recent_tweets(query=query, max_results=request.count, tweet_fields=["text", "created_at", "lang"])

        results = []
        for tweet in tweets.data:
            text = tweet.text

            # Filter out non-English tweets
            if tweet.lang != "en":
                continue

            # Sentiment Analysis
            score = analyzer.polarity_scores(text)['compound']
            sentiment = "Neutral"
            if score >= 0.05:
                sentiment = "Positive"
            elif score <= -0.05:
                sentiment = "Negative"

            results.append({
                "tweet": text,
                "sentiment": sentiment,
                "score": score
            })

        return {"query": request.query, "results": results}

    except Exception as e:
        return {"error": f"Error fetching tweets: {str(e)}"}

# Main entry point to start the server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
