import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("Network");

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectNetwork = (network) => {
    setSelectedNetwork(network);
    setIsOpen(false);
  };

  return (
    <div className="navbar justify-between md:px-24 pt-7 font-mono">
      <div>
        <div className="flex justify-center items-center px-0.5"></div>
        <div>
          <a className="text-6xl">Dashboard</a>
        </div>
      </div>
      <div className="flex">
        <button className="btn btn-active btn-primary text-2xl text-white">
          Connect Wallet
        </button>
        <details className="dropdown" open={isOpen}>
          <summary
            className="btn m-1 text-2xl ml-3 bg-slate-100 text-black hover:bg-black hover:text-white flex items-center"
            onClick={toggleDropdown}
          >
            {selectedNetwork} {isOpen ? <IoIosArrowDown /> : <IoIosArrowUp />}
          </summary>
          <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow text-xl text-black bg-white">
            {["Polygon", "Base", "Arbitrum", "Optimism"].map((network) => (
              <li key={network}>
                <a onClick={() => selectNetwork(network)}>{network}</a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
};

export default Dashboard;
