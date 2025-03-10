import { useState } from "react";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Loader2 } from "lucide-react";
import { marked } from "marked"; // Import marked for markdown parsing

const ChatAssistant = ({ poolData, poolDayDatas }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize the model with your credentials and parameters.
  const model = new ChatGroq({
    apiKey: "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",
    model: "llama3-70b-8192",
    temperature: 0.5,
    maxTokens: 500,
  });

  // Create a prompt template that includes pool summary and historical data.
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a DeFi liquidity pool expert. Use this pool data to answer questions:
      
Pool Summary:
- Pair: ${poolData.token0.symbol}/${poolData.token1.symbol}
- TVL: $${Number(poolData.totalValueLockedUSD).toLocaleString()}
- 24h Volume: $${Number(poolData.volumeUSD).toLocaleString()}
- Fee Tier: ${poolData.feeTier / 10000}%
- Transactions (24h): ${poolData.txCount}
      
Historical Data (Last 15 days):
${poolDayDatas
  .map(
    (day) => `
${new Date(day.date * 1000).toLocaleDateString()}:
- Volume: $${Number(day.volumeUSD).toLocaleString()}
- Fees: $${Number(day.feesUSD).toLocaleString()}
- Liquidity: $${Number(day.liquidity).toLocaleString()}`
  )
  .join("\n")}
      
Respond in markdown format with clear, data-supported answers.`,
    ],
    ["human", "{question}"],
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Add the user message to chat history
      setMessages((prev) => [...prev, { role: "user", content: inputMessage }]);

      // Format the prompt by inserting the current question
      const formattedPrompt = await promptTemplate.formatMessages({
        question: inputMessage,
      });

      // Get AI response
      const response = await model.invoke(formattedPrompt);

      // Append the assistant response to chat history
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.content },
      ]);

      setInputMessage("");
    } catch (err) {
      setError("Failed to get response. Please try again.");
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-slate-800 rounded-lg">
      <div className="h-96 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-900 ml-auto max-w-3/4"
                : "bg-slate-700 mr-auto max-w-3/4"
            }`}
          >
            <div className="prose prose-invert">
              {msg.role === "assistant" ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(msg.content),
                  }}
                />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="p-3 bg-slate-700 rounded-lg w-3/4">
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="animate-spin" />
              Analyzing pool data...
            </div>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-900 text-red-300 rounded-lg">{error}</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about pool metrics, trends, or comparisons..."
          className="flex-1 bg-slate-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Ask"}
        </button>
      </form>
    </div>
  );
};

export default ChatAssistant;
