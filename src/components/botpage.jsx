import PropTypes from "prop-types";
import ChatAssistant from "./bot";
import { gql, useQuery } from "@apollo/client";

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

const PoolDetailsPage = ({ poolID }) => {
  // Fetch pool data using the GET_POOLS query.
  const { loading, error, data } = useQuery(GET_POOLS, {
    variables: { poolId: poolID },
    context: { clientName: "uniswap" },
  });

  if (loading) return <div className="p-4 text-white">Loading pool data...</div>;
  if (error) return <div className="p-4 text-red-400">Error: {error.message}</div>;

  // Destructure the returned data.
  const { pool: poolData, poolDayDatas } = data;

  return (
    <div className="p-4">
      {/* Render the ChatAssistant component with the fetched data */}
      <ChatAssistant poolData={poolData} poolDayDatas={poolDayDatas} />
    </div>
  );
};

// Add prop validation
PoolDetailsPage.propTypes = {
  poolID: PropTypes.any.isRequired,
};

export default PoolDetailsPage;
