import { useEffect } from "react";


import { FaUser } from "react-icons/fa6";

export default function UserTab() {
  
  useEffect(() => {
    document.getElementById("nomeTela").innerHTML = localStorage.getItem("nomeTela");
  }, []);

  return (
    <div className="flex flex-1 justify-start items-start mt-12 mx-4 text-white">
      <div className="flex items-center bg-primary-700 w-full py-4 rounded-xl shadow-xl shadow-primary-700/30 gap-4">
        <div className="h-14 w-14 rounded-full bg-slate-600 ml-10 flex items-center">
          {" "}
          <FaUser className="text-4xl ml-2.5"/>
        </div>
        <span className="text-2xl font-semibold ml-3" id="nomeTela" />
      </div>
    </div>
  );
}
