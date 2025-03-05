import { useQuery, gql } from "@apollo/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Bitcoin, Wallet } from "lucide-react";
import { useParams } from "react-router-dom";
import PoolAnalysisAgent from "./PoolAnalysisAgent";
import PoolDetailsPage from "./botpage";

const GET_POOLS = gql`
  query GetPoolData($poolId: ID!) {
    pool(id: $poolId) {
      token0 {
        symbol
        name
      }
      token1 {
        symbol
        name
      }
      id
      feeTier
      liquidity
      volumeUSD
      totalValueLockedUSD
      txCount
    }
    poolDayDatas(
      first: 15
      orderBy: date
      orderDirection: desc
      where: { pool: $poolId }
    ) {
      date
      volumeUSD
      liquidity
      sqrtPrice
      feesUSD
      txCount
    }
  }
`;

const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-4 bg-slate-800 text-white rounded-lg shadow-md">
        <p className="font-semibold">{formatDate(data.date)}</p>
        <p>📊 Volume: ${Number(data.volumeUSD).toLocaleString()}</p>
        <p>💰 Liquidity: {Number(data.liquidity).toLocaleString()}</p>
        <p>💵 Fees: ${Number(data.feesUSD).toLocaleString()}</p>
        <p>🔄 Transactions: {data.txCount}</p>
      </div>
    );
  }
  return null;
};

const Pools = () => {
  const { poolID } = useParams();

  const { loading, error, data } = useQuery(GET_POOLS, {
    variables: { poolId: poolID },
    context: { clientName: "uniswap" },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Max fees in USD
  const maxFeesUSD =
    Math.max(...data.poolDayDatas.map((d) => Number(d.feesUSD))) || 0;

  console.log(data);

  const handleDeposit = () => {
    
  }

  return (
    <>
      <div className="bg-slate-800 h-screen flex-col">
        <div className="w-full p-5 font-mono flex flex-col lg:flex-row items-center lg:items-start bg-slate-800 gap-8">
          {/*Container for Chart */}
          <div className="w-full lg:w-2/3 h-[400px] bg-slate-900 p-5 rounded-lg shadow-md">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...data.poolDayDatas].reverse()}>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#fff"
                  dy={10}
                />
                <YAxis
                  stroke="#fff"
                  dx={-10}
                  domain={[0, maxFeesUSD * 1.2]}
                  tickFormatter={(fees) => `$${(fees / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="feesUSD"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/*Container for Pool Details */}
          <div
            key={data.pool.id}
            className="w-full lg:w-1/3 border p-6 rounded-lg shadow-md bg-slate-900 text-white"
          >
            <h3 className="text-2xl font-bold mb-4">
              {data.pool.token0.symbol} / {data.pool.token1.symbol}
            </h3>
            <p>
              🔹 <strong>Fee Tier:</strong> {data.pool.feeTier / 10000}%
            </p>
            <p>
              💰 <strong>Liquidity:</strong>{" "}
              {Number(data.pool.liquidity).toLocaleString()}
            </p>
            <p>
              📈 <strong>Volume (24h):</strong> $
              {Number(data.pool.volumeUSD).toLocaleString()}
            </p>
            <p>
              🔒 <strong>TVL:</strong> $
              {Number(data.pool.totalValueLockedUSD).toLocaleString()}
            </p>
            <p>
              📊 <strong>Transactions:</strong> {data.pool.txCount}
            </p>
            <p>
              💵 <strong>Profitability Score:</strong>
              {(Number(data.pool.volumeUSD) / Number(data.pool.liquidity)) *
                100 +
                (data.pool.feeTier / 100000) *
                  (data.pool.volumeUSD /
                    Number(data.pool.totalValueLockedUSD)) *
                  100 +
                (data.pool.txCount / Number(data.pool.liquidity)) * 1e9}
            </p>
            <div className=" rounded-lg py-6 flex flex-col items-center justify-center gap-4 ">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex items-center font-bold text-xl" onClick={handleDeposit}>
                Deposit <Bitcoin className="ml-2" />
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-bold text-xl flex">
                Withdraw <Wallet className="ml-2" />
              </button>
            </div>
          </div>
        </div>
        <div className=" p-5 flex justify-center font-mono bg-slate-800">
          <div className="w-full lg:w-2/3 p-5 rounded-lg  bg-slate-900 text-white">
            <h2 className="text-3xl mb-2">AI Agent Review :</h2>

            <PoolAnalysisAgent
              poolData={data.pool}
              poolDayDatas={data.poolDayDatas}
              poolID={poolID}
            />
            <PoolDetailsPage
            poolID={poolID}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Pools;
