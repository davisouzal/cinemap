import { Link } from "react-router-dom";

export default function SidebarTab({ children, isLogout, to, active, onClick }) {
  return (
    <Link
      to={to}
      className={`flex items-center bg-primary-700 w-full py-6 rounded-xl shadow-xl shadow-primary-700/30 gap-4 cursor-pointer transition ease-in hover:brightness-110 ${
        !isLogout && "hover:text-white"
      } ${!isLogout ? (active ? "text-white" : "text-white/50") : "text-[#C53434]"}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
