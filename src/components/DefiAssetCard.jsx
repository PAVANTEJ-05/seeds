const DefiAssetCard = ({
  poolID,
  poolToken0,
  poolToken1,
  poolFeeTier,
  poolLiquidity,
  poolVolumeUSD,
  poolTotalValueLockedUSD,
  poolTxCount,
}) => (
  <div className="bg-slate-800 rounded-lg p-4 flex justify-between items-center">
    <div key={poolID} className="border p-4 w-full rounded-lg shadow-md ">
      <h3 className="text-2xl font-bold">
        {poolToken0} / {poolToken1}
      </h3>
      <p>
        🔹 <strong>Fee Tier:</strong> {poolFeeTier / 10000}%
      </p>
      <p>
        💰 <strong>Liquidity:</strong> {Number(poolLiquidity).toLocaleString()}
      </p>
      <p>
        📈 <strong>Volume (24h):</strong> $
        {Number(poolVolumeUSD).toLocaleString()}
      </p>
      <p>
        🔒 <strong>TVL:</strong> $
        {Number(poolTotalValueLockedUSD).toLocaleString()}
      </p>
      <p>
        📊 <strong>Transactions:</strong> {poolTxCount}
      </p>
      <p>
        💵 <strong>Profitability Score: </strong>
        {(Number(poolVolumeUSD) / Number(poolLiquidity)) * 100 +
          (poolFeeTier / 100000) *
            (poolVolumeUSD / Number(poolTotalValueLockedUSD)) *
            100 +
          (poolTxCount / Number(poolLiquidity)) * 1e9}
      </p>
      <div className="flex pt-6">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-bold text-xl mx-auto">
          Manage
        </button>
      </div>
    </div>
  </div>
);

export default DefiAssetCard;
