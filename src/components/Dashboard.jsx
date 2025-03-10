import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  Bitcoin,
  Settings,
  Wallet,
  Search,
} from "lucide-react";

import OverviewCard from "./OverviewCard";
import DefiAssetCard from "./DefiAssetCard";

const GET_POOL_BY_ID = gql`
  query GetPool($poolId: ID!) {
    pool(id: $poolId) {
      id
      tick
      token0 {
        symbol
        id
        decimals
      }
      token1 {
        symbol
        id
        decimals
      }
      feeTier
      sqrtPrice
      liquidity
      volumeUSD
      totalValueLockedUSD
      txCount
    }
  }
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchPoolId, setSearchPoolId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [isConnected, setIsConnected] = useState(false);

  const sortOptions = [
    { label: "Total Value Locked", value: "totalValueLockedUSD" },
    { label: "VolumeUSD", value: "volumeUSD" },
    { label: "Liquidity", value: "liquidity" },
  ];

  const handleSortSelect = (value) => {
    setSortOption(value);
    setIsDropdownOpen(false);
  };

  const {
    loading: poolSearchLoading,
    error: poolSearchError,
    data: poolSearchData,
  } = useQuery(GET_POOL_BY_ID, {
    variables: { poolId: searchPoolId },
    context: { clientName: "uniswap" },
    skip: !isSearching || !searchPoolId,
  });

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-3)}`;
  };

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
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
  };

  const calculateProfitabilityScore = (pool) => {
    return (
      (Number(pool.volumeUSD) / Number(pool.liquidity)) * 100 +
      (pool.feeTier / 100000) *
        (pool.volumeUSD / Number(pool.totalValueLockedUSD)) *
        100 +
      (pool.txCount / Number(pool.liquidity)) * 1e9
    ).toFixed(2);
  };

  const handleSearchManageClick = (poolID) => {
    navigate(`/${poolID}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-12 font-mono">
      <div className="max-w-7xl mx-auto">
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
                      if (
                        window.ethereum &&
                        window.ethereum.removeAllListeners
                      ) {
                        window.ethereum.removeAllListeners("accountsChanged");
                      }
                      setAccount("");
                      setBalance("0.00");
                      setIsConnected(false);
                      await window.ethereum.request({
                        method: "wallet_revokePermissions",
                        params: [{ eth_accounts: {} }],
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

        {/*Code for Overview Section */}
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

        {/*Code for Pool Search Section */}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-4xl font-semibold">Top Pools</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-4 py-2 bg-slate-800 text-white rounded-md flex items-center space-x-2 hover:bg-slate-700"
              >
                <span>
                  {sortOption
                    ? sortOptions.find((opt) => opt.value === sortOption)?.label
                    : "Sort By"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-48 rounded-md bg-slate-800 shadow-lg">
                  <ul className="py-1">
                    {sortOptions.map((option) => (
                      <li
                        key={option.value}
                        className="px-4 py-2 text-white hover:bg-slate-700 cursor-pointer"
                        onClick={() => handleSortSelect(option.value)}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <input
              type="text"
              value={searchPoolId}
              onChange={(e) => {
                setSearchPoolId(e.target.value);
                setIsSearching(false);
              }}
              placeholder="Enter Pool ID..."
              className="flex-1 p-2 border rounded-md bg-slate-800 text-white"
            />
            <span
              className="text-slate-400 hover:bg-slate-950 p-2 rounded-sm cursor-pointer"
              onClick={handleSearch}
            >
              <Search />
            </span>
          </div>
        </div>

        {/*Code for Pool Search Results */}
        <div className="w-full p-2">
          {poolSearchLoading && (
            <div className="text-center py-4">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          )}

          {poolSearchError && (
            <div className="text-red-500 p-4 border border-red-200 rounded-md bg-slate-800">
              Error: {poolSearchError.message}
            </div>
          )}

          {isSearching && poolSearchData?.pool && (
            <div className="border border-slate-700 p-4 w-full rounded-lg shadow-md bg-slate-800 text-white">
              <h3 className="text-2xl font-bold">
                {poolSearchData.pool.token0.symbol} /{" "}
                {poolSearchData.pool.token1.symbol}
              </h3>
              <p>
                🔹 <strong>Fee Tier:</strong>{" "}
                {Number(poolSearchData.pool.feeTier) / 10000}%
              </p>
              <p>
                💰 <strong>Liquidity:</strong>{" "}
                {Number(poolSearchData.pool.liquidity).toLocaleString()}
              </p>
              <p>
                📈 <strong>Volume (24h):</strong> $
                {Number(poolSearchData.pool.volumeUSD).toLocaleString()}
              </p>
              <p>
                🔒 <strong>TVL:</strong> $
                {Number(
                  poolSearchData.pool.totalValueLockedUSD
                ).toLocaleString()}
              </p>
              <p>
                📊 <strong>Transactions:</strong>{" "}
                {Number(poolSearchData.pool.txCount).toLocaleString()}
              </p>
              <p>
                💵 <strong>Profitability Score: </strong>
                {calculateProfitabilityScore(poolSearchData.pool)}
              </p>
              <div className="flex pt-6">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-bold text-xl mx-auto"
                  onClick={() =>
                    handleSearchManageClick(poolSearchData.pool.id)
                  }
                >
                  Manage / Analyze
                </button>
              </div>
            </div>
          )}

          {!isSearching && <DefiAssetCard sortOption={sortOption} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
