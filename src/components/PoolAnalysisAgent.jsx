import React, { useState } from "react";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";
import { Loader2 } from "lucide-react";

// Define output schema using Zod
const analysisSchema = z.object({
  recommendation: z.enum(["Invest", "Don't Invest"]),
  confidenceLevel: z.enum(["High", "Medium", "Low"]),
  keyFactors: z.array(z.string()),
  risks: z.array(z.string()),
  opportunities: z.array(z.string()),
});

// Initialize ChatGroq
const model = new ChatGroq({
  apiKey: "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",
  model: "mixtral-8x7b-32768",
  temperature: 0.7,
  maxTokens: 1000,
});

// Create prompt template
const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a DeFi investment analyst specialized in liquidity pool analysis. Provide concise, data-driven recommendations.",
  ],
  [
    "user",
    `
Analyze the following liquidity pool data and provide an investment recommendation:

Pool Information:
- Tokens: {token0}/{token1}
- Fee Tier: {feeTier}%
- Current Liquidity: {liquidity}
- 24h Volume: {volumeUSD}
- Total Value Locked: {tvl}
- Transaction Count: {txCount}

Historical Data (15 days):
{historicalData}

Provide your analysis in the following format:
1. Recommendation: (Invest/Don't Invest)
2. Confidence Level: (High/Medium/Low)
3. Key Factors:
   - [List key factors]
4. Risks:
   - [List major risks]
5. Opportunities:
   - [List potential opportunities]
    `,
  ],
]);

const PoolAnalysisAgent = ({ poolData, poolDayDatas, poolID }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzePool = async () => {
    setLoading(true);
    setError(null);

    try {
      // Format historical data
      const historicalDataFormatted = poolDayDatas
        .map(
          (day) => `
          Date: ${new Date(day.date * 1000).toLocaleDateString()}
          - Volume: $${Number(day.volumeUSD).toLocaleString()}
          - Fees: $${Number(day.feesUSD).toLocaleString()}
          - Transactions: ${day.txCount}
        `
        )
        .join("\n");

      // Prepare prompt variables
      const promptVars = {
        token0: poolData.token0.symbol,
        token1: poolData.token1.symbol,
        feeTier: poolData.feeTier / 10000,
        liquidity: Number(poolData.liquidity).toLocaleString(),
        volumeUSD: Number(poolData.volumeUSD).toLocaleString(),
        tvl: Number(poolData.totalValueLockedUSD).toLocaleString(),
        txCount: poolData.txCount,
        historicalData: historicalDataFormatted,
      };

      // Format the prompt
      const formattedPrompt = await promptTemplate.formatMessages(promptVars);

      // Generate analysis using ChatGroq
      const response = await model.invoke(formattedPrompt);

      // Parse and format the response
      const formattedAnalysis = {
        timestamp: new Date().toISOString(),
        recommendation: response.content,
      };

      setAnalysis(formattedAnalysis);
    } catch (err) {
      setError("Failed to analyze pool data. Please try again.");
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatAnalysisContent = (content) => {
    // Split content into sections and format them
    const sections = content.split("\n").map((line, index) => {
      if (
        line.startsWith("1. Recommendation") ||
        line.startsWith("2. Confidence") ||
        line.startsWith("3. Key Factors") ||
        line.startsWith("4. Risks") ||
        line.startsWith("5. Opportunities")
      ) {
        return (
          <h3 key={index} className="font-bold mt-4 mb-2">
            {line}
          </h3>
        );
      }
      return (
        <p key={index} className="ml-4">
          {line}
        </p>
      );
    });
    return sections;
  };

  return (
    <div className="w-full lg:w-2/3 p-5 rounded-lg bg-slate-900 text-white">
      <div>
        <button
          onClick={analyzePool}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            "Analyze Pool"
          )}
        </button>
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-md">
            {error}
          </div>
        )}
        {analysis && (
          <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-gray-400">
                Analysis generated at: {" "}
                {new Date(analysis.timestamp).toLocaleString()}
              </p>
              <div className="mt-4 font-mono">
                {formatAnalysisContent(analysis.recommendation)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolAnalysisAgent;
