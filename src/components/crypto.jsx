import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpDown,
  Loader,
  Search,
  RefreshCw,
} from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-semibold">Day {label}</p>
        <p className="text-sm">${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const getColorForSymbol = (symbol) => {
  const colors = [
    "#F7931A", "#627EEA", "#9945FF", "#26A17B", "#F3BA2F", 
    "#2A5ADA", "#ED4B9E", "#00D1FF", "#5BC8F5", "#FF9900"
  ];
  return colors[symbol.charCodeAt(0) % colors.length];
};

function CryptoDashboard() {
  const [cryptoPrices, setCryptoPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sortBy, setSortBy] = useState("marketCap");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCryptoPrices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h`
      );
      if (!response.ok) throw new Error("Failed to fetch cryptocurrency prices");
      const data = await response.json();
      
      const processedData = data.map((item) => ({
        id: item.id,
        symbol: item.symbol.toUpperCase(),
        name: item.name,
        price: item.current_price,
        priceChange: item.price_change_percentage_24h,
        sparkline: item.sparkline_in_7d.price,
        marketCap: item.market_cap,
        volume: item.total_volume,
        color: getColorForSymbol(item.symbol),
      }));

      setCryptoPrices(processedData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoPrices();
    const intervalId = setInterval(fetchCryptoPrices, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const sortedAndFilteredData = cryptoPrices
    .filter((crypto) =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const multiplier = sortDirection === "desc" ? -1 : 1;
      if (sortBy === "price") return (a.price - b.price) * multiplier;
      if (sortBy === "priceChange") return (a.priceChange - b.priceChange) * multiplier;
      return (a.marketCap - b.marketCap) * multiplier;
    });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-10 space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">
            Crypto Market Dashboard
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search cryptocurrencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none"
              >
                <option value="marketCap">Market Cap</option>
                <option value="price">Price</option>
                <option value="priceChange">24h Change</option>
              </select>
              
              <button
                onClick={() => setSortDirection(prev => prev === "desc" ? "asc" : "desc")}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 flex items-center gap-2"
              >
                <ArrowUpDown size={16} />
                {sortDirection === "desc" ? "Desc" : "Asc"}
              </button>
            </div>
          </div>
        </header>

        {error ? (
          <div className="text-center p-6 bg-red-100 text-red-700 rounded-lg">
            Error: {error}. Try refreshing the page.
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedAndFilteredData.map((crypto) => (
                <div
                  key={crypto.id}
                  className="p-6 rounded-xl shadow-lg bg-white transition-transform hover:scale-[1.02]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {crypto.name} <span className="text-sm text-gray-500">({crypto.symbol})</span>
                      </h2>
                      <p className="text-3xl font-semibold text-gray-800">
                        {formatNumber(crypto.price)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-gray-500">Market Cap</span>
                      <span className="font-medium text-gray-700">
                        {formatNumber(crypto.marketCap)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {crypto.priceChange >= 0 ? (
                      <TrendingUp className="text-green-500" size={20} />
                    ) : (
                      <TrendingDown className="text-red-500" size={20} />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        crypto.priceChange >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {crypto.priceChange.toFixed(2)}% (24h)
                    </span>
                  </div>

                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={crypto.sparkline.map((price, i) => ({ day: i + 1, price }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fill: "#6B7280" }}
                        tickFormatter={(value) => value % 2 === 0 ? `Day ${value}` : ""}
                      />
                      <YAxis
                        tick={{ fill: "#6B7280" }}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                        width={60}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={crypto.color}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center flex justify-center items-center gap-4 text-gray-600">
              <button
                onClick={fetchCryptoPrices}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <RefreshCw size={16} />
                Refresh Data
              </button>
              <span className="flex items-center gap-2">
                <Clock size={16} />
                Last Updated: {lastUpdated?.toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CryptoDashboard;
