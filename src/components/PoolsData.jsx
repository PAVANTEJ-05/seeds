import { useQuery, gql } from "@apollo/client";

const GET_POOLS = gql`
  {
    pools(first: 50, orderBy: volumeUSD, orderDirection: desc) {
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

const PoolsData = () => {
  const { loading, error, data } = useQuery(GET_POOLS, {
    context: { clientName: "uniswap" },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  console.log(data);

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">Top 50 Uniswap Pools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.pools.map((pool) => (
          <div
            key={pool.id}
            className="border p-4 rounded-lg shadow-md bg-white"
          >
            <h3 className="text-lg font-semibold">
              {pool.token0.symbol} / {pool.token1.symbol}
            </h3>
            <p>
              🔹 <strong>Fee Tier:</strong> {pool.feeTier / 10000}%
            </p>
            <p>
              💰 <strong>Liquidity:</strong>{" "}
              {Number(pool.liquidity).toLocaleString()}
            </p>
            <p>
              📈 <strong>Volume (24h):</strong> $
              {Number(pool.volumeUSD).toLocaleString()}
            </p>
            <p>
              🔒 <strong>TVL:</strong> $
              {Number(pool.totalValueLockedUSD).toLocaleString()}
            </p>
            <p>
              📊 <strong>Transactions:</strong> {pool.txCount}
            </p>
            <p>
              💵 <strong>Profitability Score: </strong>
              {(Number(pool.volumeUSD) / Number(pool.liquidity)) * 100 +
                (pool.feeTier / 100000) *
                  (pool.volumeUSD / Number(pool.totalValueLockedUSD)) *
                  100 +
                (pool.txCount / Number(pool.liquidity)) * 1e9}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoolsData;
