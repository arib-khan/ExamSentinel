
// components/Loader.jsx
export default function Loader() {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="relative flex items-center justify-center">
        {/* Spinning Circle */}
        <div className="absolute w-32 h-32 rounded-full border-4 border-gray-600 border-t-blue-500 animate-spin"></div>

        {/* Logo */}
        <img
          src="/exam.png"
          alt="Loading..."
          className="w-20 h-20 relative z-10"
        />
      </div>
    </div>
  );
}

