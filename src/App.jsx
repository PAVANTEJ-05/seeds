// import "./index.css";
// import Dashboard from "./components/Dashboard";

// function App() {
//   return (
//     <>
//       <Dashboard />
//     </>
//   );
// }

// export default App;

import Home from "./components/Home";

import { Route, Routes } from "react-router-dom";
import PoolAnalysis from "./components/PoolAnalysis";
// import Dashboard from "./components/Dashboard";
// import { ToastContainer } from "react-toastify";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:poolID" element={<PoolAnalysis />} />
      {/* <Route path="" element={<PoolAnalysis />} /> */}
    </Routes>
  );
}
