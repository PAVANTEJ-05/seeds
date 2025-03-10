import { useState } from "react";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { Loader2 } from "lucide-react";

const model = new ChatGroq({
  apiKey: "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",
  model: "mixtral-8x7b-32768",
  temperature: 0.6,
  maxTokens: 1200,
});

const cryptoPromptTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      `
      You're an expert cryptocurrency analyst. Provide your analysis clearly structured in the following numbered sections:
  
      1. Current Price Evaluation:
         [Your analysis here]
  
      2. Short-term Trend (5-minute intervals):
         [Your analysis here]
  
      3. Mid-term Trend (8-hour intervals):
         [Your analysis here]
  
      4. Key Support and Resistance Levels:
         [Your analysis here]
  
      5. Potential Risks:
         - Risk 1
         - Risk 2
  
      6. Potential Opportunities:
         - Opportunity 1
         - Opportunity 2
  
      7. Final Recommendation (Buy/Hold/Sell):
         [Your recommendation here]
  
      Separate each section clearly with line breaks.
      `,
    ],
    [
      "user",
      `
      Crypto Analysis Request:
  
      Cryptocurrency: {cryptoName}
      
      Current Price: ${"{currentPrice}"}
  
      Short-term Predictions (5-min intervals):
      {shortTermPredictions}
  
      Mid-term Predictions (8-hour intervals):
      {midTermPredictions}
  
      Provide your detailed analysis now.
      `,
    ],
  ]);
  

const CryptoPriceAnalysisAgent = ({
  cryptoName,
  currentPrice,
  shortTermPredictions,
  midTermPredictions,
}) => {
  const [analysisResult, setAnalysisResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatPredictions = (predictions) =>
    predictions.map((price, idx) => `Interval ${idx + 1}: $${price}`).join("\n");

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const formattedPrompt = await cryptoPromptTemplate.formatMessages({
        cryptoName,
        currentPrice,
        shortTermPredictions: formatPredictions(shortTermPredictions),
        midTermPredictions: formatPredictions(midTermPredictions),
      });

      const response = await model.invoke(formattedPrompt);
      setAnalysisResult(response.content);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to generate analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white p-6  rounded-lg shadow-lg font-mono">
      <h2 className="text-2xl font-bold mb-4">Crypto AI Analysis for {cryptoName}</h2>

      <button
        onClick={runAnalysis}
        disabled={loading}
        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" /> Analyzing...
          </>
        ) : (
          "Run Analysis"
        )}
      </button>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-400 text-red-400 p-3 rounded-md">
          {error}
        </div>
      )}

{analysisResult && (
  <div className="mt-6 bg-slate-800 rounded-lg overflow-hidden max-w-3xl mx-auto">
    <div className="p-6 space-y-6">
      {analysisResult.split(/\n(?=\d+\.)/).map((section, index) => (
        <div key={index} className="prose prose-invert max-w-none">
          <h3 className="text-lg font-medium text-gray-200">
            {section.split(":")[0]}
          </h3>
          <div className="mt-2 text-gray-300">
            {section.split(":").slice(1).join(":").trim()}
          </div>
        </div>
      ))}
    </div>
  </div>
)}


    </div>
  );
};

export default CryptoPriceAnalysisAgent;
