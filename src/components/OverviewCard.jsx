const OverviewCard = ({ title, amount, icon: Icon, iconBgColor }) => (
  <div className="bg-slate-800 rounded-lg p-6 flex justify-between items-start">
    <div>
      <p className="text-6xl font-bold text-white mb-2">${amount}</p>
      <p className="text-slate-400 text-lg">{title}</p>
    </div>
    <div className={`p-3 rounded-full ${iconBgColor}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default OverviewCard;
