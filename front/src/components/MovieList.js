import { Link } from "react-router-dom";

import noImageAvailable from "../assets/no-image-available.png";
import { FaCircleCheck, FaCircleXmark, FaClock } from "react-icons/fa6";
import { Tooltip } from "primereact/tooltip";

export default function MovieList({ data, userMoviesIds }) {
  return (
    <>
      {data.results.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 mt-12 overflow-y-auto">
          {data.results?.map((item) => (
            <Link
              to={`/movie/${item.id}`}
              key={item.id}
              className="relative mb-12 transition-opacity ease-in duration-100 hover:opacity-40"
            >
              {userMoviesIds?.find((id) => parseInt(id[0]) === item.id) && (
                <span
                  className={`absolute z-10 text-lg top-3 flex items-center justify-center gap-6 py-1 rounded-lg w-[240px] left-[10px] text-white font-semibold
                ${userMoviesIds?.find((id) => parseInt(id[0]) === item.id)[1] === "plan" ? "bg-secondary-700" : ""}
                ${userMoviesIds?.find((id) => parseInt(id[0]) === item.id)[1] === "completed" ? "bg-[#609F6E]" : ""}
                ${userMoviesIds?.find((id) => parseInt(id[0]) === item.id)[1] === "dropped" ? "bg-[#9F6060]" : ""}
                `}
                >
                  {userMoviesIds?.find((id) => parseInt(id[0]) === item.id)[1] === "plan" ? (
                    <FaClock size={24} />
                  ) : userMoviesIds?.find((id) => parseInt(id[0]) === item.id)[1] === "completed" ? (
                    <FaCircleCheck size={24} />
                  ) : userMoviesIds?.find((id) => parseInt(id[0]) === item.id)[1] === "dropped" ? (
                    <FaCircleXmark size={24} />
                  ) : (
                    ""
                  )}
                  {userMoviesIds?.find((id) => parseInt(id[0]) === item.id)[1] === "plan"
                    ? "Plan to watch"
                    : userMoviesIds?.find((id) => parseInt(id[0]) === item.id)[1] === "completed"
                    ? "Completed"
                    : userMoviesIds?.find((id) => parseInt(id[0]) === item.id)[1] === "dropped"
                    ? "Dropped"
                    : ""}
                </span>
              )}
              <Tooltip target=".tooltip-target" position="top" />
              {item.poster_path ? (
                <>
                  <img
                    className={`tooltip-target rounded-2xl w-[260px] h-[390px] ${
                      userMoviesIds?.find((id) => parseInt(id[0]) === item.id) ? "opacity-40" : ""
                    }`}
                    data-pr-tooltip={item.title}
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title}
                  />
                </>
              ) : (
                <img
                  className={`tooltip-target rounded-2xl w-[260px] h-[390px] ${
                    userMoviesIds?.find((id) => parseInt(id[0]) === item.id) ? "opacity-40" : ""
                  }`}
                  data-pr-tooltip={item.title}
                  src={noImageAvailable}
                  alt={item.title}
                />
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
