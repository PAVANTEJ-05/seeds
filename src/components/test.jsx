import { useState, useCallback } from "react";
import { Send, Zap, ShieldCheck, Cpu } from "lucide-react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
const GROQ_API_KEY = "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";

function DecentralizedIntelligenceAgent() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [walletAccount, setWalletAccount] = useState(null);

  // Connect to MetaMask and return the wallet address
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAccount(accounts[0]);
        return accounts[0];
      } catch (walletError) {
        setError(`Wallet connection failed: ${walletError.message}`);
        throw walletError;
      }
    } else {
      const errMsg = "MetaMask is not installed. Please install it to use this feature.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Fetch wallet balance
  const fetchWalletData = async () => {
    const account = await connectWallet();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(account);
    const formattedBalance = ethers.utils.formatEther(balance.toString());
    return { account, formattedBalance };
  };

  // Chat API Call
  const callChatAPI = async (userMessage, maxTokenAttempts = 3) => {
    let currentMaxTokens = 1024;
    for (let attempt = 0; attempt < maxTokenAttempts; attempt++) {
      try {
        const apiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mixtral-8x7b-32768",
            messages: [
              { role: "system", content: `You are a precise cryptocurrency intelligence agent. 
Provide a well-structured response that:
- Delivers complete information
- Avoids unnecessary verbosity
- Ensures no truncation of critical details
- Maintains a professional, informative tone` },
              { role: "user", content: userMessage },
            ],
            temperature: 1,
            max_tokens: currentMaxTokens,
          }),
        });

        if (!apiResponse.ok) throw new Error("Network response was not ok");
        const data = await apiResponse.json();
        const responseContent = data.choices[0].message.content.trim();

        if (responseContent.endsWith("...") || responseContent.length < currentMaxTokens * 0.9) {
          currentMaxTokens *= 2;
          continue;
        }

        return responseContent;
      } catch (fetchError) {
        if (attempt === maxTokenAttempts - 1) throw fetchError;
        currentMaxTokens *= 2;
      }
    }
  };

  // Query Processing
  const processQuery = useCallback(async (inputQuery) => {
    if (!inputQuery || !GROQ_API_KEY) {
      setError("Configuration error: Missing API credentials");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResponse("");
    try {
      let finalQuery = inputQuery;
      if (inputQuery.toLowerCase().includes("wallet balance")) {
        const { account, formattedBalance } = await fetchWalletData();
        finalQuery = `Wallet: ${account}\nBalance: ${formattedBalance} ETH\n${inputQuery}`;
      }
      const completeResponse = await callChatAPI(finalQuery);
      setResponse(completeResponse);
    } catch (processingError) {
      setError(`Query processing failed: ${processingError.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [setError, setIsLoading, setResponse]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-6 space-y-6">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        <Link to="/">
          <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-blue-600 transition-colors">Home</button>
        </Link>
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 flex items-center justify-between">
          <div className="flex items-center">
            <Cpu className="text-white mr-4" size={40} />
            <h1 className="text-2xl font-bold text-white">Decentralized Intelligence Agent</h1>
          </div>
          <button onClick={connectWallet} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
            {walletAccount ? `Wallet: ${walletAccount.substring(0, 6)}...${walletAccount.slice(-4)}` : "Connect Wallet"}
          </button>
        </div>
        <div className="p-6">
          <textarea
            className="w-full p-4 pr-12 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none min-h-[120px]"
            placeholder="Ask about wallet balance, investments, or any crypto topic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); processQuery(query); } }}
          />
          <button onClick={() => processQuery(query)} disabled={isLoading} className="absolute bottom-3 right-3 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700">
            <Send size={20} />
          </button>
        </div>
        <div className="p-6 bg-gray-50 min-h-[300px] max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center text-indigo-600">
              <Zap className="animate-pulse mr-2" />
              <span>Processing query...</span>
            </div>
          ) : error ? (
            <div className="flex items-center text-red-500">
              <ShieldCheck className="mr-2" />
              <span>{error}</span>
            </div>
          ) : response ? (
            <div className="text-gray-700 whitespace-pre-wrap">
              <h3 className="font-semibold text-lg mb-3 text-indigo-600">Response:</h3>
              <p>{response}</p>
            </div>
          ) : (
            <div className="text-center text-gray-400">Your response will appear here</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DecentralizedIntelligenceAgent;
