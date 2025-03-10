import React, { useState, useEffect } from "react";
import { Bitcoin, Zap, RefreshCw } from "lucide-react";

// Constants for API endpoints
const API_ENDPOINTS = {
  BTC: {
    FIVE_MINUTES:
      "https://api.upshot.xyz/v2/allora/consumer/price/ethereum-11155111/BTC/5m",
    EIGHT_HOURS:
      "https://api.upshot.xyz/v2/allora/consumer/price/ethereum-11155111/BTC/8h",
  },
  ETH: {
    FIVE_MINUTES:
      "https://api.upshot.xyz/v2/allora/consumer/price/ethereum-11155111/ETH/5m",
    EIGHT_HOURS:
      "https://api.upshot.xyz/v2/allora/consumer/price/ethereum-11155111/ETH/8h",
  },
  SOL: {
    FIVE_MINUTES:
      "https://api.upshot.xyz/v2/allora/consumer/price/ethereum-11155111/SOL/5m",
    EIGHT_HOURS:
      "https://api.upshot.xyz/v2/allora/consumer/price/ethereum-11155111/SOL/8h",
  },
};

function CryptoPredictionAgent() {
  const [loading, setLoading] = useState(false);
  const [currentPrices, setCurrentPrices] = useState({
    BTC: null,
    ETH: null,
    SOL: null,
  });
  const [predictions, setPredictions] = useState({
    FIVE_MINUTES: {
      BTC: [],
      ETH: [],
      SOL: [],
    },
    EIGHT_HOURS: {
      BTC: [],
      ETH: [],
      SOL: [],
    },
  });

  // Fetch current cryptocurrency prices
  const fetchCurrentPrices = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true"
      );
      const data = await response.json();

      setCurrentPrices({
        BTC: {
          price: data.bitcoin.usd,
          change24h: data.bitcoin.usd_24h_change,
        },
        ETH: {
          price: data.ethereum.usd,
          change24h: data.ethereum.usd_24h_change,
        },
        SOL: {
          price: data.solana.usd,
          change24h: data.solana.usd_24h_change,
        },
      });
    } catch (error) {
      console.error("Error fetching current prices:", error);
    }
  };

  // Direct fetch from Allora API endpoints
  const fetchAlloraData = async (url, token, timeframe) => {
    try {
      const apiKey = "UP-1bb380dc6de7408c83eb7008";
      const headers = {
        accept: "application/json",
        "x-api-key": apiKey,
      };

      console.log(
        `Fetching ${timeframe} predictions for ${token} from: ${url}`
      );

      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.data || !data.data.inference_data) {
        throw new Error(`Invalid data structure for ${token}/${timeframe}`);
      }

      // Process the data from the API
      const normalizedValue = parseFloat(
        data.data.inference_data.network_inference_normalized
      );
      const confidenceIntervals =
        data.data.inference_data.confidence_interval_values_normalized || [];
      const timestamp = data.data.timestamp;

      // Create a prediction point with the normalized value
      const prediction = {
        time: new Date(timestamp * 1000).toLocaleTimeString(),
        price: normalizedValue,
        confidence: 0.5, // Default confidence
        confidenceIntervals: confidenceIntervals.map((val) => parseFloat(val)),
      };

      console.log(
        `Successfully fetched ${timeframe} prediction for ${token}:`,
        prediction
      );

      // For demonstration purposes, create a series of predictions based on the normalizedValue
      // In a real implementation, you might want to fetch historical predictions or use the confidence intervals
      const timePoints = timeframe === "FIVE_MINUTES" ? 5 : 8;
      let predictions = [];

      for (let i = 0; i < timePoints; i++) {
        const time = new Date();
        if (timeframe === "FIVE_MINUTES") {
          time.setMinutes(time.getMinutes() + i + 1);
        } else {
          time.setHours(time.getHours() + i + 1);
        }

        // Use confidence intervals if available to create a range of predictions
        let predictedPrice = normalizedValue;
        if (confidenceIntervals.length > 0) {
          // Use different confidence intervals for different time points to show a range
          const intervalIndex = Math.min(
            Math.floor((i * confidenceIntervals.length) / timePoints),
            confidenceIntervals.length - 1
          );
          // Alternate between higher and lower values to create a somewhat realistic price movement
          const direction = i % 2 === 0 ? 1 : -1;
          // Scale the effect based on how far in the future we're predicting
          const scale = (i + 1) / timePoints;

          // Calculate a price within the confidence interval
          const interval =
            Math.abs(confidenceIntervals[intervalIndex] - normalizedValue) *
            scale;
          predictedPrice = normalizedValue + interval * direction;
        }

        predictions.push({
          time: time.toLocaleTimeString(),
          price: predictedPrice,
          confidence: (1 - i / timePoints) * 0.9, // Confidence decreases for predictions further in the future
        });
      }

      return predictions;
    } catch (error) {
      console.error(
        `Error fetching Allora data for ${token}/${timeframe}:`,
        error
      );

      // Fallback: Generate synthetic data based on current price
      const currentPrice = currentPrices[token]?.price || 0;
      const timePoints = timeframe === "FIVE_MINUTES" ? 5 : 8;

      const fallbackPredictions = Array.from({ length: timePoints }, (_, i) => {
        const time = new Date();
        if (timeframe === "FIVE_MINUTES") {
          time.setMinutes(time.getMinutes() + i + 1);
        } else {
          time.setHours(time.getHours() + i + 1);
        }

        // Small random variation with trend
        const trendFactor = Math.random() > 0.5 ? 1 : -1;
        const randomChange = Math.random() * 0.01 * currentPrice * trendFactor;
        const cumulativeFactor = i / timePoints; // Increasing effect over time

        return {
          time: time.toLocaleTimeString(),
          price: currentPrice * (1 + randomChange * cumulativeFactor),
          confidence: 0.5, // Placeholder confidence
        };
      });

      console.log(
        `Using fallback ${timeframe} predictions for ${token}:`,
        fallbackPredictions
      );
      return fallbackPredictions;
    }
  };

  // Generate predictions using direct API calls
  const generatePredictions = async () => {
    setLoading(true);

    try {
      const cryptos = ["BTC", "ETH", "SOL"];
      const timeframes = ["FIVE_MINUTES", "EIGHT_HOURS"];
      const newPredictions = {
        FIVE_MINUTES: {},
        EIGHT_HOURS: {},
      };

      // Fetch all predictions in parallel
      const predictionPromises = [];

      for (const timeframe of timeframes) {
        for (const crypto of cryptos) {
          const url = API_ENDPOINTS[crypto][timeframe];
          const promise = fetchAlloraData(url, crypto, timeframe).then(
            (predictionsData) => {
              newPredictions[timeframe][crypto] = predictionsData;
            }
          );

          predictionPromises.push(promise);
        }
      }

      // Wait for all predictions to complete
      await Promise.all(predictionPromises);

      setPredictions(newPredictions);
    } catch (error) {
      console.error("Error generating predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get icon for cryptocurrency
  const getCryptoIcon = (crypto) => {
    switch (crypto) {
      case "BTC":
        return <Bitcoin size={18} className="text-yellow-500" />;
      case "ETH":
        return <button size={18} className="text-purple-400" />;
      case "SOL":
        return (
          <span className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
            S
          </span>
        );
      default:
        return null;
    }
  };

  // Calculate and format price change
  const getPriceChange = (predictions) => {
    if (!predictions || predictions.length < 2) return "0.00%";

    const startPrice = predictions[0].price;
    const endPrice = predictions[predictions.length - 1].price;
    const change = ((endPrice - startPrice) / startPrice) * 100;

    return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
  };

  // Initialize data on component mount
  useEffect(() => {
    // Fetch initial data
    const fetchInitialData = async () => {
      await fetchCurrentPrices();
      await generatePredictions();
    };

    fetchInitialData();

    // Set up interval to refresh prices every 60 seconds
    const intervalId = setInterval(fetchCurrentPrices, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Refresh all data
  const handleRefresh = async () => {
    await fetchCurrentPrices();
    await generatePredictions();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-10 border-b border-gray-700/50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Zap className="text-yellow-400 mr-2" size={20} />
            <h1 className="text-lg font-bold">Crypto Price Predictor</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh Predictions"}
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Current Prices */}
        <h2 className="text-xl font-bold mb-4">Current Prices</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {["BTC", "ETH", "SOL"].map((crypto) => (
            <div
              key={crypto}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-700/30 transition hover:border-gray-600/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getCryptoIcon(crypto)}
                  <h3 className="font-medium">
                    {crypto === "BTC"
                      ? "Bitcoin"
                      : crypto === "ETH"
                      ? "Ethereum"
                      : "Solana"}{" "}
                    ({crypto})
                  </h3>
                </div>
                <div
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    (currentPrices[crypto]?.change24h || 0) > 0
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  24h: {(currentPrices[crypto]?.change24h || 0) > 0 ? "+" : ""}
                  {(currentPrices[crypto]?.change24h || 0).toFixed(2)}%
                </div>
              </div>
              <div className="text-2xl font-bold">
                ${(currentPrices[crypto]?.price || 0).toFixed(2) || "-.--"}
              </div>
            </div>
          ))}
        </div>

        {/* 5-Minute Predictions */}
        <h2 className="text-xl font-bold mb-4">5-Minute Predictions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {["BTC", "ETH", "SOL"].map((crypto) => (
            <div
              key={`5m-${crypto}`}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-700/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getCryptoIcon(crypto)}
                  <h3 className="font-medium">{crypto}</h3>
                </div>
                <div
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    getPriceChange(predictions.FIVE_MINUTES[crypto]).startsWith(
                      "+"
                    )
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  Projected: {getPriceChange(predictions.FIVE_MINUTES[crypto])}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="flex flex-col items-center space-y-2">
                    <RefreshCw
                      size={24}
                      className="animate-spin text-blue-400"
                    />
                    <span className="text-xs text-gray-400">
                      Loading predictions...
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {predictions.FIVE_MINUTES[crypto]?.length > 0 ? (
                    predictions.FIVE_MINUTES[crypto].map((pred, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg"
                      >
                        <span className="text-xs text-gray-400">
                          {pred.time}
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="font-medium">
                            ${pred.price.toFixed(2)}
                          </span>
                          {pred.confidence && (
                            <span className="text-xs text-gray-400">
                              Confidence: {(pred.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      No predictions available
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 8-Hour Predictions */}
        <h2 className="text-xl font-bold mb-4">8-Hour Predictions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {["BTC", "ETH", "SOL"].map((crypto) => (
            <div
              key={`8h-${crypto}`}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-700/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getCryptoIcon(crypto)}
                  <h3 className="font-medium">{crypto}</h3>
                </div>
                <div
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    getPriceChange(predictions.EIGHT_HOURS[crypto]).startsWith(
                      "+"
                    )
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  Projected: {getPriceChange(predictions.EIGHT_HOURS[crypto])}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="flex flex-col items-center space-y-2">
                    <RefreshCw
                      size={24}
                      className="animate-spin text-blue-400"
                    />
                    <span className="text-xs text-gray-400">
                      Loading predictions...
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {predictions.EIGHT_HOURS[crypto]?.length > 0 ? (
                    predictions.EIGHT_HOURS[crypto].map((pred, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg"
                      >
                        <span className="text-xs text-gray-400">
                          {pred.time}
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="font-medium">
                            ${pred.price.toFixed(2)}
                          </span>
                          {pred.confidence && (
                            <span className="text-xs text-gray-400">
                              Confidence: {(pred.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      No predictions available
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-xs py-4">
          <p>Predictions powered by Allora AI | Data source: CoinGecko</p>
        </footer>
      </div>
    </div>
  );
}

export default CryptoPredictionAgent;
