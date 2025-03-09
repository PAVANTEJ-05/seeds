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
  const [chatHistory, setChatHistory] = useState([]);

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
      const errMsg =
        "MetaMask is not installed. Please install it to use this feature.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Fetch wallet balance
  const fetchWalletData = async () => {
    try {
      const account = await connectWallet();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(account);
      const formattedBalance = ethers.utils.formatEther(balance.toString());
      return { account, formattedBalance };
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      setError(`Failed to fetch wallet data: ${error.message}`);
      return { account: null, formattedBalance: "0" };
    }
  };

  // Chat API Call
  const callChatAPI = async (messages) => {
    try {
      const apiResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mixtral-8x7b-32768",
            messages: messages,
            temperature: 0.7, // Reduced for more consistent responses
            max_tokens: 2048, // Increased for more complete answers
          }),
        }
      );

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        throw new Error(
          `API Error (${apiResponse.status}): ${
            errorData.error?.message || apiResponse.statusText
          }`
        );
      }

      const data = await apiResponse.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("API call error:", error);
      throw error;
    }
  };

  // Query Processing
  const processQuery = useCallback(
    async (inputQuery) => {
      if (!inputQuery.trim() || !GROQ_API_KEY) {
        setError("Please enter a question or missing API credentials");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let walletContext = "";
        // Check if query is related to wallet or personal crypto data
        if (
          inputQuery.toLowerCase().includes("wallet") ||
          inputQuery.toLowerCase().includes("balance") ||
          inputQuery.toLowerCase().includes("my") ||
          inputQuery.toLowerCase().includes("account")
        ) {
          try {
            const { account, formattedBalance } = await fetchWalletData();
            if (account) {
              walletContext = `The user's connected wallet address is ${account} with a balance of ${formattedBalance} ETH. `;
            }
          } catch (walletError) {
            console.log(
              "Wallet data fetch failed but continuing with query",
              walletError
            );
          }
        }

        // Construct messages array with conversation history
        const systemMessage = {
          role: "system",
          content: `You are a helpful and conversational cryptocurrency assistant that provides accurate, natural responses.
${walletContext}
Guidelines:
- Respond in a natural, conversational manner
- Be concise but complete; prioritize accuracy
- If you don't know something, admit it rather than making up information
- When discussing cryptocurrency topics, ensure information is clear and relevant
- For technical concepts, explain them in simple terms
- If the query is unclear, politely ask for clarification
- Focus on being helpful rather than rigid or formal`,
        };

        // Prepare messages including history (with a reasonable limit)
        const messagesToSend = [
          systemMessage,
          ...chatHistory.slice(-6), // Keep last 6 messages for context
          { role: "user", content: inputQuery },
        ];

        const aiResponse = await callChatAPI(messagesToSend);

        // Update chat history
        setChatHistory([
          ...chatHistory,
          { role: "user", content: inputQuery },
          { role: "assistant", content: aiResponse },
        ]);

        setResponse(aiResponse);
      } catch (processingError) {
        setError(`Failed to get response: ${processingError.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [chatHistory]
  );

  const clearChat = () => {
    setChatHistory([]);
    setResponse("");
    setQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-6 space-y-6">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-2 bg-gray-100">
          <Link to="/">
            <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-blue-600 transition-colors">
              Home
            </button>
          </Link>
        </div>
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 flex items-center justify-between">
          <div className="flex items-center">
            <Cpu className="text-white mr-4" size={40} />
            <h1 className="text-2xl font-bold text-white">
              Decentralized Intelligence Agent
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearChat}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              Clear Chat
            </button>
            <button
              onClick={connectWallet}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              {walletAccount
                ? `${walletAccount.substring(0, 6)}...${walletAccount.slice(
                    -4
                  )}`
                : "Connect Wallet"}
            </button>
          </div>
        </div>

        <div className="p-6 bg-gray-50 min-h-[300px] max-h-[500px] overflow-y-auto">
          {chatHistory.length === 0 && !response && !isLoading && !error ? (
            <div className="text-center text-gray-500 p-6">
              <p className="mb-2 font-medium">
                Welcome to your Crypto Assistant!
              </p>
              <p>
                Ask about cryptocurrencies, blockchain, or connect your wallet
                to check balances.
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-600">Try asking:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "What is Ethereum?",
                    "How do smart contracts work?",
                    "What's my wallet balance?",
                    "Explain DeFi",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setQuery(suggestion);
                        processQuery(suggestion);
                      }}
                      className="text-left p-2 bg-white border border-gray-200 rounded hover:bg-gray-100 text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    msg.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-white border border-gray-200 text-gray-800"
                    } max-w-[80%]`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center justify-center text-indigo-600 p-4">
                  <Zap className="animate-pulse mr-2" />
                  <span>Thinking...</span>
                </div>
              )}

              {error && (
                <div className="flex items-center text-red-500 p-4 bg-red-50 rounded">
                  <ShieldCheck className="mr-2" />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 relative">
          <textarea
            className="w-full p-4 pr-12 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none min-h-[120px]"
            placeholder="Ask about cryptocurrencies, blockchain technology, or your wallet..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                processQuery(query);
              }
            }}
          />
          <button
            onClick={() => processQuery(query)}
            disabled={isLoading}
            className="absolute bottom-10 right-10 bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DecentralizedIntelligenceAgent;
