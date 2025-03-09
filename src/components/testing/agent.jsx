// import { useState, useRef, useEffect } from "react";
// import { Send, Loader, Bot, ChevronDown, ChevronUp } from "lucide-react";
// import { ChatGroq } from "@langchain/groq";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { marked } from "marked";

// function DeFiAIAgent() {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [inputMessage, setInputMessage] = useState("");
//   const [messages, setMessages] = useState([
//     {
//       role: "assistant",
//       content:
//         "Hello! I can help answer questions about how crypto price predictions might affect DeFi protocols, liquidity pools, and the broader ecosystem. What would you like to know about?",
//     },
//   ]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const messagesEndRef = useRef(null);

//   // Initialize the model with the same credentials from bot.js
//   const model = new ChatGroq({
//     apiKey: "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",
//     model: "mixtral-8x7b-32768",
//     temperature: 0.5,
//     maxTokens: 500,
//   });

//   // Create the same prompt template as in bot.js
//   const createPromptTemplate = () => {
//     return ChatPromptTemplate.fromMessages([
//       [
//         "system",
//         `You are a DeFi liquidity pool expert. Use this pool data to answer questions:

// Current Price Predictions: ${JSON.stringify(poolData, null, 2)}
// Historical Data: ${JSON.stringify(poolDayDatas, null, 2)}

// Focus on explaining how these price predictions affect:
// 1. USDC/ETH pools and impermanent loss
// 2. Polygon network fees and validator economics
// 3. Amoy scaling solution adoption
// 4. General DeFi lending, borrowing, and liquidity conditions

// Give specific, technical insights but explain concepts clearly. When possible, reference specific data points from the provided information. Keep answers concise (3-5 sentences) but informative.`,
//       ],
//       ["human", "{input}"],
//     ]);
//   };

//   // Handle sending a message
//   const handleSendMessage = async () => {
//     if (!inputMessage.trim() || loading) return;

//     // Add user message
//     const userMessage = { role: "user", content: inputMessage };
//     setMessages((prev) => [...prev, userMessage]);
//     setInputMessage("");
//     setLoading(true);
//     setError(null);

//     try {
//       const promptTemplate = createPromptTemplate();
//       const chain = promptTemplate.pipe(model);

//       // Send the message to the model
//       const response = await chain.invoke({
//         input: inputMessage,
//       });

//       // Convert markdown to HTML if needed
//       const formattedContent = response.content;

//       // Add AI response
//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "assistant",
//           content: formattedContent,
//         },
//       ]);
//     } catch (err) {
//       console.error("Error getting AI response:", err);
//       setError("Sorry, I encountered an error. Please try again.");
//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "assistant",
//           content:
//             "Sorry, I encountered an error processing your request. Please try again.",
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Auto-scroll to bottom of messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Handle Enter key press
//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   // Render markdown content
//   const renderMarkdown = (content) => {
//     try {
//       return { __html: marked(content) };
//     } catch (error) {
//       console.error("Markdown parsing error:", error);
//       return { __html: content };
//     }
//   };

//   return (
//     <div className="fixed bottom-4 right-4 w-full max-w-md z-20">
//       {/* Collapsed header */}
//       <div
//         className={`${
//           isExpanded ? "rounded-t-xl" : "rounded-xl shadow-lg"
//         } bg-blue-600 p-4 cursor-pointer flex items-center justify-between`}
//         onClick={() => setIsExpanded(!isExpanded)}
//       >
//         <div className="flex items-center space-x-2">
//           <Bot size={20} className="text-white" />
//           <h3 className="font-medium text-white">DeFi AI Assistant</h3>
//         </div>
//         {isExpanded ? (
//           <ChevronDown size={20} className="text-white" />
//         ) : (
//           <ChevronUp size={20} className="text-white" />
//         )}
//       </div>

//       {/* Expanded chat area */}
//       {isExpanded && (
//         <div className="bg-gray-800 rounded-b-xl shadow-xl border border-gray-700 flex flex-col">
//           {/* Messages area */}
//           <div className="h-80 overflow-y-auto p-4 space-y-4">
//             {messages.map((message, index) => (
//               <div
//                 key={index}
//                 className={`flex ${
//                   message.role === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-xs md:max-w-md rounded-lg p-3 ${
//                     message.role === "user"
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-700 text-gray-100"
//                   }`}
//                 >
//                   {message.role === "assistant" ? (
//                     <div
//                       className="markdown-content"
//                       dangerouslySetInnerHTML={renderMarkdown(message.content)}
//                     />
//                   ) : (
//                     message.content
//                   )}
//                 </div>
//               </div>
//             ))}

//             {loading && (
//               <div className="flex justify-start">
//                 <div className="bg-gray-700 rounded-lg p-3 flex items-center space-x-1">
//                   <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
//                   <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-75"></div>
//                   <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
//                 </div>
//               </div>
//             )}

//             {error && (
//               <div className="text-center p-2 text-red-400 text-sm">
//                 {error}
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input area */}
//           <div className="p-4 border-t border-gray-700">
//             <div className="flex items-center bg-gray-700 rounded-lg">
//               <textarea
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Ask about DeFi impacts of these predictions..."
//                 className="flex-1 bg-transparent border-0 focus:ring-0 text-white p-3 max-h-20 resize-none"
//                 rows="1"
//               />
//               <button
//                 onClick={handleSendMessage}
//                 disabled={!inputMessage.trim() || loading}
//                 className="p-3 text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed"
//               >
//                 {loading ? (
//                   <Loader size={18} className="animate-spin" />
//                 ) : (
//                   <Send size={18} />
//                 )}
//               </button>
//             </div>
//             <div className="mt-2 text-xs text-gray-500 text-center">
//               Try asking: How will these ETH predictions affect USDC/ETH pools?
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default DeFiAIAgent;
