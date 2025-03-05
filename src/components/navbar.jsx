import { useState } from "react";
import { DollarSign, TrendingUp, Bitcoin, Wallet } from "lucide-react";

import OverviewCard from "./OverviewCard";

const Navbar = () => {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setAccount(account);
        setIsConnected(true);

        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [account, "latest"],
        });

        const ethBalance = parseInt(balance) / Math.pow(10, 18);
        setBalance(ethBalance.toFixed(4));
      } catch (error) {
        console.error("Wallet Connection Error:", error);
        alert("Failed to connect wallet. Please try again.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <>
    <div className="min-h-screen bg-slate-900 p-12 font-mono relative">
      <div className="max-w-7xl mx-auto">
        {/* Existing Navbar Header and Overview Cards */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-white text-6xl font-bold">YieldSage</h1>
          <div className="flex space-x-4">
            {isConnected ? (
              <>
                <span className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold text-xl">
                  {account.slice(0, 4)}...{account.slice(-3)}
                </span>
                <button
                  onClick={() => {
                    setAccount("");
                    setBalance("0.00");
                    setIsConnected(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-bold text-xl"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-bold text-xl"
              >
                Connect
              </button>
            )}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <OverviewCard
            title="Balance"
            amount={balance}
            icon={DollarSign}
            iconBgColor="bg-yellow-600/20 text-yellow-500"
          />
          <OverviewCard
            title="Earnings"
            amount="0.00"
            icon={TrendingUp}
            iconBgColor="bg-cyan-600/20 text-cyan-500"
          />
          <div className="bg-slate-800 rounded-lg p-4 flex flex-col items-center justify-center gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex items-center font-bold text-xl">
              Deposit <Bitcoin className="ml-2" />
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-bold text-xl flex">
              Withdraw <Wallet className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Navbar;