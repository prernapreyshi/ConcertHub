import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-[#B48] text-black px-6 py-4 flex justify-between items-center shadow-md">
      <h1 className="text-2xl font-bold">Finance Visualizer</h1>
      <div className="flex gap-6 text-base font-semibold">
        <Link to="/add" className="hover:underline hover:opacity-90 transition-opacity duration-200">
          Add Transaction
        </Link>
      </div>
    </nav>
  );
}
