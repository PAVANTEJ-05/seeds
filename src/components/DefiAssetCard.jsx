import { useQuery, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const GET_POOLS = gql`
  query GetPools($orderBy: String!) {
    pools(first: 9, orderBy: $orderBy, orderDirection: desc) {
      id
      token0 {
        symbol
        name
      }
      token1 {
        symbol
        name
      }
      feeTier
      liquidity
      volumeUSD
      totalValueLockedUSD
      txCount
    }
  }
`;

const DefiAssetCard = ({ sortOption }) => {
  const navigate = useNavigate();

  // Map the sortOption to the actual field names expected by the API
  const getSortField = (option) => {
    const sortMapping = {
      totalValueLocked: "totalValueLockedUSD",
      volumeUSD: "volumeUSD",
      liquidity: "liquidity",
    };
    return sortMapping[option] || "totalValueLockedUSD"; // default sort
  };

  const { loading, error, data } = useQuery(GET_POOLS, {
    variables: {
      orderBy: getSortField(sortOption),
    },
    context: { clientName: "uniswap" },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleManageClick = (poolID) => {
    navigate(`/${poolID}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-800 p-4">
      {data.pools.map((pool) => (
        <div key={pool.id} className="border p-4 w-full rounded-lg shadow-md">
          <h3 className="text-2xl font-bold">
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
            {(
              (Number(pool.volumeUSD) / Number(pool.liquidity)) * 100 +
              (pool.feeTier / 100000) *
                (pool.volumeUSD / Number(pool.totalValueLockedUSD)) *
                100 +
              (pool.txCount / Number(pool.liquidity)) * 1e9
            ).toFixed(2)}
          </p>
          <div className="flex pt-6">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-bold text-xl mx-auto"
              onClick={() => handleManageClick(pool.id)}
            >
              Manage / Analyze
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DefiAssetCard;
