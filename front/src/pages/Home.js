import React, { useEffect, useState } from "react";
import { useAuthUser } from "react-auth-kit";

import MovieFilter from "../components/Home/MovieFilter";
import Sidebar from "../components/Sidebar/Sidebar";
import Body from "../components/Body";
import emptyIcon from "../assets/empty-icon.png";
import plusIcon from "../assets/plus-icon.svg";

import cinemap from "../assets/cinemap.svg";
import MovieList from "../components/MovieList";
import Skeleton from "../components/Skeleton";
import { Link } from "react-router-dom";

export default function Home() {
  const [data, setData] = useState({ results: [] });
  const [movies, setMovies] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [dropped, setDropped] = useState([]);
  const [plan, setPlan] = useState([]);
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const authUser = useAuthUser();

  const token = authUser().token;

  async function getMovie(tmdbId) {
    const response = await fetch(`http://localhost:3002/movies/searchById/${tmdbId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const movie = await response.json();

    return movie;
  }

  useEffect(() => {
    setData({ results: [] });
    setMovies([]);

    const id = localStorage.getItem("id");
    async function getCompletedMovies() {
      if (completed.length > 0) {
        return setMovies(completed);
      }

      setIsLoading(true);

      const completedReq = await fetch(`http://localhost:3002/users/movies?userId=${id}&status=completed`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const completedIds = await completedReq.json();

      if (completedIds.length > 0) {
        completedIds.forEach(async (movie) => {
          const movieData = await getMovie(movie.tmdb_id);
          setCompleted((completed) => [...completed, movieData]);
          setMovies((movies) => [...movies, movieData]);
        });
      }
      setIsChecking(false);
    }

    async function getDroppedMovies() {
      if (dropped.length > 0) {
        return setMovies(dropped);
      }

      setIsLoading(true);

      const droppedReq = await fetch(`http://localhost:3002/users/movies?userId=${id}&status=dropped`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const droppedIds = await droppedReq.json();

      if (droppedIds.length > 0) {
        droppedIds.forEach(async (movie) => {
          const movieData = await getMovie(movie.tmdb_id);
          setDropped((dropped) => [...dropped, movieData]);
          setMovies((movies) => [...movies, movieData]);
        });
      }
      setIsChecking(false);
    }

    async function getPlanMovies() {
      if (plan.length > 0) {
        return setMovies(plan);
      }

      setIsLoading(true);
      const planReq = await fetch(`http://localhost:3002/users/movies?userId=${id}&status=plan`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const planIds = await planReq.json();

      if (planIds.length > 0) {
        planIds.forEach(async (movie) => {
          const movieData = await getMovie(movie.tmdb_id);
          setPlan((plan) => [...plan, movieData]);
          setMovies((movies) => [...movies, movieData]);
        });
      }
      setIsChecking(false);
    }

    setIsChecking(true);
    if (filter === "completed") getCompletedMovies();
    else if (filter === "dropped") getDroppedMovies();
    else if (filter === "plan") getPlanMovies();
  }, [filter]);

  useEffect(() => {
    const moviesResults = [...new Map(movies.map((movie) => [movie["id"], movie])).values()];
    const moviesResultsFiltered = moviesResults.filter((movie) => movie.id !== undefined);
    setData({ results: moviesResultsFiltered });
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [movies]);

  useEffect(() => {
    setFilter("completed");
  }, []);

  return (
    <div className="h-full flex gap-1">
      <Sidebar />
      <Body>
        <div className="flex gap-60">
          <img src={cinemap} alt="cinemap's logo" className="h-10"></img>
          <MovieFilter setFilter={setFilter} filter={filter} />
        </div>
        {isLoading && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 mt-12 overflow-y-auto">
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        )}
        {data.results.length > 0 && !isLoading && <MovieList data={data} />}
        {!isLoading && !isChecking && data.results.length === 0 && (
          <>
            <div className="flex flex-col items-center h-full justify-center font-medium">
              <img src={emptyIcon} alt="Your movie library is empty" className="h-44" />
              <h2 className="text-5xl pt-10">Your movie library is empty</h2>
              <h3 className="italic text-white/50 text-xl pt-4">Add a movie to your collection</h3>
            </div>
            <Link
              to="/search"
              className="bg-primary-700 hover:brightness-125 transition text-white h-20 w-20 rounded-full absolute bottom-10 right-10 shadow-lg flex items-center justify-center"
            >
              <img src={plusIcon} alt="Plus sign" className="w-10" />
            </Link>
          </>
        )}
      </Body>
    </div>
  );
}
