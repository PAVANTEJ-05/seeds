import React, { useState } from "react";
import { ethers } from "ethers";
import { Zap, RefreshCw } from "lucide-react";

// ABI and Contract Address (updated)
const CONSUMER_CONTRACT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "topicId", type: "uint256" }],
    name: "getMostRecentTopicValue",
    outputs: [
      { internalType: "uint256", name: "recentValue", type: "uint256" },
      { internalType: "uint256", name: "recentValueTime", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const CONTRACT_ADDRESS = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";

const SONIC_CONFIG = {
  chainId: "0xDEDE", // Hexadecimal for 57054
  chainName: "Sonic Testnet",
  nativeCurrency: {
    name: "Sonic",
    symbol: "SONIC",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.blaze.soniclabs.com"],
  blockExplorerUrls: ["https://testnet.sonicscan.org/"],
};

const AlloraInferenceData = () => {
  const [topicId, setTopicId] = useState(1); // Default topic ID
  const [prediction, setPrediction] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Connect wallet and switch to Sonic Testnet
  const connectWallet = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!window.ethereum) throw new Error("MetaMask not installed.");

      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Add or switch to Sonic Testnet
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [SONIC_CONFIG],
      });

      setIsConnected(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on-chain using ethers.js
  const fetchInferenceData = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!isConnected) throw new Error("Please connect your wallet first");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONSUMER_CONTRACT_ABI,
        provider
      );

      // Fetch prediction and timestamp from smart contract
      console.log("Fetching data for topic ID:", topicId); // Debugging log

      const [recentValue, recentValueTime] =
        await contract.getMostRecentTopicValue(topicId);

      // Format results
      const predictionValue = ethers.utils.formatUnits(recentValue, 8); // Adjust decimals as per your contract
      const timestampValue = new Date(
        recentValueTime.toNumber() * 1000
      ).toLocaleString();

      console.log("Fetched Prediction:", predictionValue); // Debugging log
      console.log("Fetched Timestamp:", timestampValue); // Debugging log

      setPrediction(predictionValue);
      setTimestamp(timestampValue);
    } catch (err) {
      console.error("Error fetching data:", err); // Debugging log
      setError(err.message || "Failed to fetch inference data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-50 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Allora On-Chain Inference Data
        </h1>

        {!isConnected ? (
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Connect Wallet
          </button>
        ) : (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Connected
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label>Topic ID:</label>
        <input
          type="number"
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <button onClick={fetchInferenceData} disabled={!isConnected || isLoading}>
        {isLoading ? (
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <>Fetch Inference</>
        )}
      </button>

      <button onClick={fetchInferenceData} disabled={!isConnected || isLoading}>
        Refresh Data
      </button>

      {prediction && timestamp ? (
        <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Prediction Data</h2>
          <p>Prediction Value: ${parseFloat(prediction).toFixed(4)}</p>
          <p>Last Updated at {timestamp}</p>
        </div>
      ) : (
        !error &&
        !isLoading && (
          <p className="mt-6 text-gray-500">
            No prediction data available. Fetch predictions to display.
          </p>
        )
      )}
    </div>
  );
};

export default AlloraInferenceData;
