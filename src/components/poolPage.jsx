import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import DefiAssetCard from "./DefiAssetCard";
// import Navbar from "./poolsNav";

const GET_POOL_BY_ID = gql`
  query GetPool($poolId: ID!) {
    pool(id: $poolId) {
      id
      token0 {
        symbol
      }
      token1 {
        symbol
      }
      feeTier
      liquidity
      volumeUSD
      totalValueLockedUSD
      txCount
    }
  }
`;

const PoolsPage = () => {
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchPoolId, setSearchPoolId] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const sortOptions = [
    { label: "Total Value Locked", value: "totalValueLockedUSD" },
    { label: "VolumeUSD", value: "volumeUSD" },
    { label: "Liquidity", value: "liquidity" },
  ];

  const {
    loading: poolSearchLoading,
    error: poolSearchError,
    data: poolSearchData,
  } = useQuery(GET_POOL_BY_ID, {
    variables: { poolId: searchPoolId },
    context: { clientName: "uniswap" },
    skip: !isSearching || !searchPoolId,
  });

  const calculateProfitabilityScore = (pool) => {
    return (
      (Number(pool.volumeUSD) / Number(pool.liquidity)) * 100 +
      (pool.feeTier / 100000) *
        (pool.volumeUSD / Number(pool.totalValueLockedUSD)) *
        100
    ).toFixed(2);
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen bg-slate-900 p-12 font-mono">
        <div className="max-w-7xl mx-auto">
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
                      ? sortOptions.find((opt) => opt.value === sortOption)
                          ?.label
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
                          onClick={() => {
                            setSortOption(option.value);
                            setIsDropdownOpen(false);
                          }}
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
                onClick={() => setIsSearching(true)}
              >
                <Search />
              </span>
            </div>
          </div>

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
                  📊 <strong>Profitability Score: </strong>
                  {calculateProfitabilityScore(poolSearchData.pool)}
                </p>
                <div className="flex pt-6">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-bold text-xl mx-auto"
                    onClick={() => navigate(`${poolSearchData.pool.id}`)}
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
    </>
  );
};

export default PoolsPage;