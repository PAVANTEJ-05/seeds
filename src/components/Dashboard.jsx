import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Bitcoin,
  Settings,
  Wallet,
} from "lucide-react";
import PoolsData from "./Pools.json";

import OverviewCard from "./OverviewCard";
import DefiAssetCard from "./DefiAssetCard";

const Dashboard = () => {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [isConnected, setIsConnected] = useState(false);

  // Format address to show first 4 and last 3 characters
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-3)}`;
  };

  // Connect to MetaMask
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
        console.log("Wallet Balance:", ethBalance, "ETH");

        window.ethereum.on("accountsChanged", function (accounts) {
          setAccount(accounts[0]);
          getBalance(accounts[0]);
        });
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const getBalance = async (address) => {
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      const ethBalance = parseInt(balance) / Math.pow(10, 18);
      setBalance(ethBalance.toFixed(4));
      console.log("Updated Balance:", ethBalance, "ETH");
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  console.log(PoolsData);

  return (
    <div className="min-h-screen bg-slate-900 p-12 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-white text-6xl font-bold">YieldSage</h1>
          <div className="flex space-x-4">
            {isConnected ? (
              <>
                <span className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold text-xl">
                  {formatAddress(account)}
                </span>
                <button
                  onClick={async () => {
                    try {
                      // Clear wallet connection
                      if (
                        window.ethereum &&
                        window.ethereum.removeAllListeners
                      ) {
                        window.ethereum.removeAllListeners("accountsChanged");
                      }

                      // Reset local state
                      setAccount("");
                      setBalance("0.00");
                      setIsConnected(false);

                      // Clear MetaMask cached permissions
                      await window.ethereum.request({
                        method: "wallet_revokePermissions",
                        params: [
                          {
                            eth_accounts: {},
                          },
                        ],
                      });
                    } catch (error) {
                      console.error("Error during logout:", error);
                    }
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

        {/* Overview Section */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-4xl font-semibold">Overview</h2>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 hover:bg-slate-950 p-2 rounded-sm">
              <Settings />
            </span>
          </div>
        </div>
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

        {/* DeFi Assets Section */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-4xl font-semibold">Investments</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PoolsData.map((PoolData) => (
            <DefiAssetCard
              key={PoolData.id}
              poolID={PoolData.id}
              poolToken0={PoolData.token0.symbol}
              poolToken1={PoolData.token1.symbol}
              poolFeeTier={PoolData.feeTier}
              poolLiquidity={PoolData.liquidity}
              poolVolumeUSD={PoolData.volumeUSD}
              poolTotalValueLockedUSD={PoolData.totalValueLockedUSD}
              poolTxCount={PoolData.txCount}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
