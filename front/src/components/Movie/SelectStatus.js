import { useState } from "react";
import { FaChevronDown, FaCircleCheck, FaCircleExclamation, FaCircleXmark, FaClock, FaPlus } from "react-icons/fa6";

import "./SelectStatus.css";

export default function SelectStatus({ token, toast, title, tmdbId, movie, movieId, movieStatus, setMovieStatus }) {
  const [open, setOpen] = useState(false);

  const movieStatusString = {
    unset: "Remove from library",
    plan: "Plan to watch",
    completed: "Completed",
    dropped: "Dropped",
  };

  async function saveMovie(movie) {
    const id = localStorage.getItem("id");

    const response = await fetch(`http://localhost:3002/users/movies/${tmdbId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "plan", userId: id }),
    });

    if (response.status !== 201) {
      const data = await response.json();
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: data.error,
        life: 4000,
      });
      return;
    }

    setMovieStatus("plan");
    toast.current.show({
      severity: "success",
      summary: "Movie saved successfully",
      detail: `${title} saved to your list`,
      life: 4000,
    });
    setOpen(false);
  }

  async function changeStatus(status) {
    const response = await fetch(`http://localhost:3002/users/movies/${movieId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (response.status !== 200) {
      await response.json();
      toast.current.show({
        severity: "error",
        summary: "Error",
        life: 4000,
      });
      return;
    }

    setMovieStatus(status);
    toast.current.show({
      severity: "success",
      summary: "Status changed successfully",
      detail: `${title} is now ${movieStatusString[status]}`,
      life: 4000,
    });
    setOpen(false);
  }

  async function deleteMovie() {
    if (movieStatus === "unset") return;

    const response = await fetch(`http://localhost:3002/users/movies/${movieId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status !== 200) {
      const data = await response.json();
      console.log(data);
      toast.current.show({
        severity: "error",
        summary: "Error",
        life: 4000,
      });
      return;
    }

    setMovieStatus("unset");
    toast.current.show({
      severity: "success",
      summary: "Movie removed successfully",
      detail: `${title} removed from your list`,
      life: 4000,
    });
  }

  return (
    <>
      {movieStatus === "unset" ? (
        <div
          className="flex w-80 rounded-xl items-center text-2xl font-semibold py-3 justify-center gap-3 px-6 border-[5px] border-secondary-700 text-secondary-700 cursor-pointer transition hover:text-white hover:bg-secondary-700"
          onClick={() => saveMovie()}
        >
          <FaPlus size={24} />
          Add to your library
        </div>
      ) : (
        <div className={`select-menu ${open ? "active" : ""}`}>
          <div
            className={`select-btn relative ${
              movieStatus === "plan"
                ? "bg-secondary-700"
                : movieStatus === "completed"
                ? "bg-[#609F6E]"
                : "bg-[#9F6060]"
            }`}
            onClick={() => setOpen(!open)}
          >
            <div className="select-text flex gap-4 items-center font-semibold">
              {movieStatus === "plan" ? (
                <FaClock size={25} />
              ) : movieStatus === "completed" ? (
                <FaCircleCheck size={25} />
              ) : (
                <FaCircleXmark size={25} />
              )}
              <span>{movieStatusString[movieStatus]}</span>
            </div>
            <FaChevronDown size={32} className="chevron" />
          </div>

          <ul className="options">
            <li className="option" onClick={() => deleteMovie()}>
              <FaCircleExclamation size={25} />
              <span className="option-text">Remove from library</span>
            </li>
            <li className="option" onClick={() => changeStatus("plan")}>
              <FaClock size={25} />
              <span className="option-text">Plan to watch</span>
            </li>
            <li className="option" onClick={() => changeStatus("completed")}>
              <FaCircleCheck size={25} />
              <span className="option-text">Completed</span>
            </li>
            <li className="option" onClick={() => changeStatus("dropped")}>
              <FaCircleXmark size={25} />
              <span className="option-text">Dropped</span>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
