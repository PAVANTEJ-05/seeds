import { Route, Routes } from "react-router-dom";
import PoolAnalysis from "./components/PoolAnalysis";
import Dashboard from "./components/Dashboard";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/:poolID" element={<PoolAnalysis />} />
    </Routes>
  );
}
