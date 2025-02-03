// app/hooks/useVolume


// app/hooks/useVolume.ts
import { useEffect, useState } from "react";
import { PriceData, VolumeData } from "../types";



/**
 * Aggregates trades by minute (based on timestamp),
 * sums last_size to produce volume, and returns
 * an array of VolumeData with `time` in seconds.
 */
const useVolume = (priceData: PriceData[]): VolumeData[] => {
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);

  useEffect(() => {
    if (!priceData.length) {
      setVolumeData([]);
      return;
    }

    // 1. Group by the same minute
    //    "minuteKey" => total volume in that minute
    const volumeMap = new Map<number, number>();

    for (const data of priceData) {
      // Convert ms -> number of whole minutes since epoch
      // E.g. 1738006800000 ms => 28966780 minuteKey (example)
      const minuteKey = Math.floor(data.timestamp / (1000 * 60));

      const currentVolume = volumeMap.get(minuteKey) || 0;
      volumeMap.set(minuteKey, currentVolume + data.last_size);
    }

    // 2. Convert back to an array sorted by minuteKey
    const sortedKeys = Array.from(volumeMap.keys()).sort((a, b) => a - b);

    // 3. Build final volume data
    //    Convert minuteKey back to seconds: minuteKey * 60
    const computedVolume: VolumeData[] = sortedKeys.map((key) => ({
      time: key * 60,                // minuteKey => seconds
      value: volumeMap.get(key) ?? 0 // sum of last_size
    }));

    console.log("Computed volume data:", computedVolume);
    setVolumeData(computedVolume);
  }, [priceData]);

  return volumeData;
};

export default useVolume;
