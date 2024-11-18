import React from "react";
import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar/Sidebar";
import Body from "../components/Body";
import Tooltip from "../components/Tooltip";

import { FaWandMagicSparkles } from "react-icons/fa6";

import cinemap from "../assets/cinemap.svg";
import MovieList from "../components/MovieList";
import { useAuthUser } from "react-auth-kit";
import Skeleton from "../components/Skeleton";

export default function Explore() {
  const [data, setData] = useState({ results: [] });
  const [userMovies, setUserMovies] = useState([]);
  const [detailedMovies, setDetailedMovies] = useState([]);
  const [exploreMovies, setExploreMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const authUser = useAuthUser();

  const token = authUser().token;

  async function getMovieDetails(movie) {
    const id = movie.tmdbId;
    const state = movie.status;
    const rating = movie.rating || 0;

    const prod_genres_res = await fetch(`https://api.themoviedb.org/3/movie/${id}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
      },
    });

    const prod_genres = await prod_genres_res.json();
    const title = prod_genres.title;
    const production_companies = prod_genres.production_companies.map((company) => company.name);
    const genres = prod_genres.genres.map((genre) => genre.name);

    const keywords_res = await fetch(`https://api.themoviedb.org/3/movie/${id}/keywords`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
      },
    });

    const keywords_objs = await keywords_res.json();
    const keywords = keywords_objs.keywords.map((keyword) => keyword.name);

    const credits_res = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
      },
    });

    const credits = await credits_res.json();
    const cast = credits.cast.map((person) => person.name);
    const crew = credits.crew.filter((person) => person.job === "Director").map((person) => person.name);

    return {
      id,
      title,
      production_companies,
      keywords,
      cast,
      crew,
      genres,
      rating,
      state,
    };
  }

  useEffect(() => {
    async function getUserMovies() {
      const moviesReq = await fetch(`http://localhost:3002/users/movies`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const movies = await moviesReq.json();
      setUserMovies(movies);
    }

    getUserMovies();
  }, []);

  useEffect(() => {
    async function appendMovieDetails() {
      const detailedMoviesArray = await Promise.all(
        userMovies.map(async (movie) => {
          return await getMovieDetails(movie);
        }),
      );
      setDetailedMovies(detailedMoviesArray);
    }

    if (userMovies.length > 0) appendMovieDetails();
  }, [userMovies]);

  useEffect(() => {
    async function fetchExploreMovies() {
      const response = await fetch(`http://localhost:8000/explore/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movies: detailedMovies }),
      });

      const exploreIds = await response.json();
      const exploreMovies = exploreIds.filter((id, index) => exploreIds.indexOf(id) === index);
      setExploreMovies(exploreMovies);
    }

    if (detailedMovies.length > 0 && exploreMovies.length === 0) fetchExploreMovies();
  }, [detailedMovies]);

  useEffect(() => {
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

    async function appendExploreMovies() {
      const exploreMoviesArray = await Promise.all(
        exploreMovies.map(async (movie) => {
          return await getMovie(movie);
        }),
      );

      setData({ results: exploreMoviesArray });
      setIsLoading(false);
    }

    if (exploreMovies.length > 0) appendExploreMovies();
  }, [exploreMovies]);

  return (
    <div className="h-full flex gap-1">
      <Sidebar />
      <Body>
        <div className="flex justify-between items-center">
          <img src={cinemap} alt="cinemap's logo" className="h-10 flex-1"></img>
          <div className="w-full flex justify-end">
            <span className="flex relative items-center">
              <div
                className="flex h-10 px-8 py-2 rounded-full shadow-md shadow-black/25 transition items-center"
                style={{ background: "rgba(159, 64, 192, 0.35)" }}
                onMouseEnter={() => {
                  setShowTooltip(true);
                }}
                onMouseLeave={() => {
                  setShowTooltip(false);
                }}
              >
                <span className="text-color-primary text-xl cursor-pointer">Powered with AI</span>{" "}
                <FaWandMagicSparkles size={20} className="text-white ml-3" />
              </div>
              {showTooltip && <Tooltip />}
            </span>
          </div>
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
        {!isLoading && data.results?.length === 0 ? (
          <div className="overflow-y-hidden h-full items-center flex justify-center">
            <div className="flex items-center justify-center text-2xl font-semibold text-white/50 italic">
              Something went wrong...
            </div>
          </div>
        ) : (
          <MovieList data={data} />
        )}
      </Body>
    </div>
  );
}
