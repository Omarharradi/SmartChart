import { Time } from "lightweight-charts";

export interface PriceData {
    timestamp: number; // Unix timestamp in milliseconds
    open: number;
    high: number;
    low: number;
    close: number;
    last_size: number;
  }
  
  export interface MovingAverageData {
    time: number; // Unix timestamp in seconds
    value: number;
  }
  


  export interface VolumeData {
    time: number; // in seconds
    value: number; // sum of last_size for that minute
  }