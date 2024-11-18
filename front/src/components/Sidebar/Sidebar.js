import { useSignOut } from "react-auth-kit";

import { FaRightFromBracket, FaCompass, FaMagnifyingGlass, FaClapperboard } from "react-icons/fa6";

import UserTab from "./UserTab";
import SidebarTab from "./SidebarTab";

export default function Sidebar() {
  const signOut = useSignOut();

  function handleLogout() {
    signOut();
    window.location.reload();
  }

  const url = window.location.pathname;

  return (
    <div className="bg-primary-500 flex flex-[3] flex-col w-full">
      <UserTab />
      <div className="flex flex-col gap-8 flex-2 justify-center items-center mx-4">
        <SidebarTab to="/home" active={url === "/home"}>
          <FaClapperboard size={36} className="ml-10" />
          <span className="text-2xl font-semibold ml-3">Movies</span>
        </SidebarTab>
        <SidebarTab to="/search" active={url === "/search"}>
          <FaMagnifyingGlass size={36} className="ml-10" />
          <span className="text-2xl font-semibold ml-3">Search</span>
        </SidebarTab>
        <SidebarTab to="/explore" active={url === "/explore"}>
          <FaCompass size={36} className="ml-10" />
          <span className="text-2xl font-semibold ml-3">Explore</span>
        </SidebarTab>
      </div>
      <div className="flex flex-1 justify-center items-end mb-12 mx-4 ">
        <SidebarTab to="#" onClick={handleLogout} isLogout>
          <FaRightFromBracket size={36} className="ml-10" />
          <span className="text-2xl font-semibold ml-3">Logout</span>
        </SidebarTab>
      </div>
    </div>
  );
}
