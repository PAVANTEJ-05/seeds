import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  Bitcoin,
  Wallet,
  Bot,
  BarChart2,
  LineChart,
} from "lucide-react";
import OverviewCard from "./OverviewCard";

const Navbar = () => {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState("");

  const navigate = useNavigate();

  // Sonic Labs Testnet configuration
  const sonicTestnet = {
    chainId: "0xDEDE", // 8009 in decimal
    chainName: "Sonic Testnet",
    nativeCurrency: {
      name: "Sonic",
      symbol: "SONIC",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.blaze.soniclabs.com/"],
    blockExplorerUrls: ["https://testnet.sonicscan.org/"],
  };

  // Function to add the Sonic Testnet to MetaMask
  const addSonicNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [sonicTestnet],
      });
      return true;
    } catch (error) {
      console.error("Error adding Sonic network:", error);
      return false;
    }
  };

  // Function to switch to Sonic Testnet
  const switchToSonicNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: sonicTestnet.chainId }],
      });
      return true;
    } catch (error) {
      // Error code 4902 means the network is not yet added
      if (error.code === 4902) {
        return await addSonicNetwork();
      }
      console.error("Error switching to Sonic network:", error);
      return false;
    }
  };

  // Function to get the current network
  const updateNetworkInfo = async () => {
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId === sonicTestnet.chainId) {
        setNetwork("Sonic Testnet");
      } else {
        const networkName = chainId === "0x1" ? "Ethereum Mainnet" : 
                          chainId === "0x3" ? "Ropsten Testnet" :
                          chainId === "0x4" ? "Rinkeby Testnet" :
                          chainId === "0x5" ? "Goerli Testnet" :
                          chainId === "0x89" ? "Polygon" :
                          `Unknown (${chainId})`;
        setNetwork(networkName);
      }
    } catch (error) {
      console.error("Error getting network:", error);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        
        // Try to switch to Sonic Testnet
        const switched = await switchToSonicNetwork();
        if (!switched) {
          alert("Please switch to Sonic Testnet to use this application.");
          return;
        }
        
        // Get updated network info
        await updateNetworkInfo();
        
        // Set account details
        setAccount(account);
        setIsConnected(true);

        // Get balance in the Sonic network
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [account, "latest"],
        });

        const ethBalance = parseInt(balance) / Math.pow(10, 18);
        setBalance(ethBalance.toFixed(4));
        
        // Setup listeners for network and account changes
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });
        
        window.ethereum.on("accountsChanged", (accounts) => {
          if (accounts.length === 0) {
            // User disconnected their wallet
            setAccount("");
            setBalance("0.00");
            setIsConnected(false);
          } else {
            // User switched accounts
            setAccount(accounts[0]);
            // Refresh balance
            window.ethereum.request({
              method: "eth_getBalance",
              params: [accounts[0], "latest"],
            }).then(balance => {
              const ethBalance = parseInt(balance) / Math.pow(10, 18);
              setBalance(ethBalance.toFixed(4));
            });
          }
        });
        
      } catch (error) {
        console.error("Wallet Connection Error:", error);
        alert("Failed to connect wallet. Please try again.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-12 font-mono relative">
      <div className="max-w-7xl mx-auto">
        {/* Original Header and Wallet Connection */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-white text-6xl font-bold">YieldSage</h1>
          <div className="flex space-x-4">
            {isConnected ? (
              <>
                <span className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold text-xl">
                  {account.slice(0, 4)}...{account.slice(-3)}
                </span>
                <span className="bg-green-600 text-white px-6 py-2 rounded-md font-bold text-xl">
                  {network}
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
                Connect to Sonic
              </button>
            )}
          </div>
        </div>

        {/* Original Overview Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <OverviewCard
            title="Balance (Sonic)"
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
            CryptoCurrency Dashboard 
            <Link
              to={"/crypto"}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex items-center font-bold text-xl"
            >
              <LineChart className="h-8 w-8 text-white" /> <Bitcoin className="ml-2" /> 
            </Link> 
          </div>
        </div>

        {/* Enhanced Routing Section with ONLY the original three buttons */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-700 mb-8">
          <h2 className="text-center text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">
            Welcome to YieldSage
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI DeFi Assistant - Even More Colorful */}
            <Link
              to="/sage"
              className="group relative overflow-hidden p-1 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-500 to-blue-600 animate-pulse-slow rounded-xl"></div>
              <div className="relative bg-slate-800 rounded-lg p-6 h-full flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 mb-4">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-indigo-300 to-blue-300">
                  AI DeFi Assistant
                </h3>
                <p className="text-slate-300 mb-4">
                  Get personalized help with your DeFi strategies and instant
                  answers to all your crypto questions.
                </p>
                <span className="mt-auto inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold">
                  Ask AI <Bot className="ml-2 h-4 w-4" />
                </span>
              </div>
            </Link>

            {/* Liquidity Pools Explorer - Enhanced */}
            <Link
              to="/pools"
              className="group relative overflow-hidden p-1 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 animate-pulse-slow rounded-xl"></div>
              <div className="relative bg-slate-800 rounded-lg p-6 h-full flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 mb-4">
                  <BarChart2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-emerald-300 to-teal-300">
                  Liquidity Pools
                </h3>
                <p className="text-slate-300 mb-4">
                  Discover high-yield opportunities and deep insights into the
                  most profitable liquidity pools.
                </p>
                <span className="mt-auto inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold">
                  Explore Pools <BarChart2 className="ml-2 h-4 w-4" />
                </span>
              </div>
            </Link>

            {/* Crypto Analytics Suite - Enhanced */}
            <Link
              to="/test"
              className="group relative overflow-hidden p-1 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-600 animate-pulse-slow rounded-xl"></div>
              <div className="relative bg-slate-800 rounded-lg p-6 h-full flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-4">
                  <LineChart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                  AI Price Predictions
                </h3>
                <p className="text-slate-300 mb-4">
                  Track market trends with powerful crypto analytics tools and
                  make data-driven investment decisions.
                </p>
                <span className="mt-auto inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold">
                  View Analytics <LineChart className="ml-2 h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>

          <div className="text-center mt-8 text-slate-300">
            <p className="text-lg">
              Experience the future of DeFi with YieldSage powerful tools
            </p>
            <p className="text-sm mt-2 text-slate-400">
              Connect your wallet to get started on Sonic Testnet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;