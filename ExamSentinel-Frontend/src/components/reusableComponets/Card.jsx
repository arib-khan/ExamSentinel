// Card component
export const Card = ({ icon, title, value, activeBg, valueColor = "" }) => (
    <div
        className={`rounded-xl border p-4 flex flex-col items-center justify-center transition-colors
        ${activeBg || "bg-white border-gray-200 "}
      `}
    >
        {icon}
        <p className="text-sm mt-2 text-white">{title}</p>
        <p className={`text-xl font-bold text-white`}>{value}</p>
    </div>
);