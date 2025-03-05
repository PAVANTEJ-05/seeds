import { Route, Routes } from "react-router-dom";
import PoolAnalysis from "./components/PoolAnalysis";
import DecentralizedIntelligenceAgent from "./components/test";
import Navbar from "./components/navbar";
import CryptoDashboard from "./components/crypto";
import PoolsPage from "./components/poolPage";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navbar />} />
      <Route path="/:poolID" element={<PoolAnalysis />} />
      <Route path="/sage" element={<DecentralizedIntelligenceAgent />} />
      <Route path="/crypto" element={<CryptoDashboard />} />
      <Route path="/pools" element={<PoolsPage />} />

    </Routes>
  );
}
