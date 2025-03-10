import { Route, Routes } from "react-router-dom";
import PoolAnalysis from "./components/PoolAnalysis";
import DecentralizedIntelligenceAgent from "./components/test";
import Navbar from "./components/navbar";
import CryptoDashboard from "./components/crypto";
import PoolsPage from "./components/poolPage";
import CryptoPredictionAgent from "./components/all";
// import OnChainPredictions from "./components/quick";
import AlloraInferenceData from "./components/quick";
// import CryptoPredictionAgent1 from "./components/quick";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navbar />} />
      <Route path="/:poolID" element={<PoolAnalysis />} />
      <Route path="/sage" element={<DecentralizedIntelligenceAgent />} />
      <Route path="/crypto" element={<CryptoDashboard />} />
      <Route path="/pools" element={<PoolsPage />} />
      <Route path="/test" element={<CryptoPredictionAgent />} />
      <Route path="/aa" element={<AlloraInferenceData />} />
    </Routes>
  );
}
