import { useParams } from "react-router-dom";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { useAuthUser } from "react-auth-kit";

import Sidebar from "../components/Sidebar/Sidebar";
import Body from "../components/Body";
import Skeleton from "../components/Skeleton";

import cinemap from "../assets/cinemap.svg";
import noImageAvailable from "../assets/no-image-available.png";

import { FaFloppyDisk, FaRegStar, FaRegStarHalfStroke, FaStar } from "react-icons/fa6";
import { Toast } from "primereact/toast";
import SelectStatus from "../components/Movie/SelectStatus";
import { Tooltip } from "primereact/tooltip";

export default function Movie() {
  const [movie, setMovie] = useState({});
  const toast = useRef(null);
  const authUser = useAuthUser();
  const token = authUser().token;

  const params = useParams();
  const tmdbId = params.id;

  const [movieStatus, setMovieStatus] = useState("unset");
  const [movieId, setMovieId] = useState(null);
  const [data, setData] = useState({ results: [] });
  const [recommendedMovies, setRecommendedMovies] = useState([]);

  const [rating, setRating] = useState(0);
  const [definitive, setDefinitive] = useState(false);

  const handleStarHover = (hoveredRating) => {
    if (!definitive) setRating(hoveredRating);
  };

  const setRatingDefinitive = (rating) => {
    setRating(rating);
    setDefinitive(true);
  };

  async function saveRating() {
    const id = localStorage.getItem("id");
    const response = await fetch(`http://localhost:3002/users/movies/${movieId}?userId=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating: rating }),
    });

    await response.json();

    console.log(await response.json());

    if (response.status === 200) {
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Rating saved",
        life: 3000,
      });
    } else {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while saving your rating",
        life: 3000,
      });
    }
  }

  useEffect(() => {
    const id = localStorage.getItem("id");
    async function getMovieStatus() {
      const response = await fetch(`http://localhost:3002/users/movies/${tmdbId}?userId=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 200) {
        setMovieStatus("unset");
        return;
      }

      try {
        const data = await response.json();
        console.log(data);
        setMovieStatus(data.status);
        setMovieId(data.id);
        setRating(data.rating);
        if (data.rating) setDefinitive(true);
      } catch (err) {}
    }

    if (tmdbId) getMovieStatus();
    setDefinitive(false);
  }, [movieStatus]);

  useEffect(() => {
    async function getMovie() { 
      const id = localStorage.getItem("id");
      const response = await fetch(`http://localhost:3002/movies/searchById/${tmdbId}?userId=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setMovie(data);
    }

    async function fetchRecommendedMovies() {
      setRecommendedMovies([]);
      setData({ results: [] });
      const id = tmdbId;
      const state = movieStatus;

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

      const response = await fetch(`http://localhost:8000/recommend/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, title, production_companies, keywords, cast, crew, genres, rating, state }),
      });

      const data = await response.json();
      setRecommendedMovies(data);
    }

    getMovie(tmdbId);
    fetchRecommendedMovies();
  }, [tmdbId]);

  useEffect(() => {
    async function getRecommendedMovies() {
      recommendedMovies.forEach(async (item) => {
        const response = await fetch(`http://localhost:3002/movies/searchById/${item}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const movie = await response.json();
        if (movie.id in data.results) return;
        setData((data) => ({ results: [...data.results, movie] }));
      });
    }

    if (recommendedMovies) getRecommendedMovies();
  }, [recommendedMovies]);

  return (
    <div className="h-full flex gap-1">
      <Toast ref={toast} />
      <Sidebar />
      <Body>
        <div className="flex gap-10">
          <img src={cinemap} alt="cinemap" className="h-10" />
        </div>
        <div className="flex flex-col gap-10">
          <div className="flex mt-16 flex-1">
            <div className="flex gap-10">
              {movie.poster_path ? (
                <>
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-80 rounded-2xl"
                  />
                </>
              ) : (
                <img src={noImageAvailable} alt={movie.title} className="w-80 rounded-2xl" />
              )}
              <div className="max-w-2xl">
                <h1 className="text-4xl font-semibold line-clamp-2 pb-2" title={movie.title}>
                  {movie.title}
                </h1>
                <div className="flex flex-col gap-4 mt-10 text-white/50">
                  <h2 className="text-3xl font-bold">
                    {movie.year} | <span className="font-normal">{movie.production}</span> | {movie.runtime}
                  </h2>
                  <span className="text-2xl font-normal line-clamp-3">{movie.overview}</span>
                </div>
                {movie.genres && (
                  <div className="flex gap-4 mt-10 text-xl font-semibold text-white">
                    {movie.genres.map((genre) => (
                      <div
                        key={genre.id}
                        className="flex-none bg-secondary-700 px-8 py-2 rounded-full shadow-md shadow-black/25 transition hover:shadow-black/70 cursor-pointer"
                      >
                        {genre.name}
                      </div>
                    ))}
                  </div>
                )}
                {movie.fullStars && (
                  <div className="flex gap-1 mt-10" title={movie.vote_average}>
                    {movie.fullStars.map((_, i) => (
                      <FaStar size={56} color="#FFC107" key={i} />
                    ))}
                    {movie.hasHalfStar && <FaRegStarHalfStroke size={58} color="#FFC107" />}
                    {movie.emptyStars.map((_, i) => (
                      <FaRegStar size={56} color="#FFC107" key={i} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex">
            <div className="flex gap-10 max-h-[480px]">
              <SelectStatus
                toast={toast}
                tmdbId={tmdbId}
                movie={movie}
                title={movie.title}
                movieId={movieId}
                movieStatus={movieStatus}
                setMovieStatus={setMovieStatus}
              />
              {(movieStatus === "completed" || movieStatus === "dropped") && (
                <>
                  <div className="flex gap-1" onMouseLeave={() => handleStarHover(0)}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div
                        key={value}
                        onMouseEnter={() => handleStarHover(value)}
                        onMouseLeave={() => handleStarHover(rating)}
                        onClick={() => setRatingDefinitive(value)}
                      >
                        {value <= (rating || 0) ? (
                          <FaStar className="cursor-pointer text-secondary-700 w-14 h-14" />
                        ) : (
                          <FaRegStar className="cursor-pointer text-secondary-700 w-14 h-14" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div
                    className="flex w-40 h-fit rounded-xl items-center text-2xl font-semibold py-3 justify-center gap-3 px-6 border-[5px] border-secondary-700 text-secondary-700 cursor-pointer transition hover:text-white hover:bg-secondary-700"
                    onClick={saveRating}
                  >
                    <FaFloppyDisk className="w-7 h-7" />
                    Save
                  </div>
                </>
              )}
            </div>
          </div>
          <h1 className="w-[730px] h-[55px] font-semibold text-5xl pt-20">Recommended movies</h1>

          <div className={`grid grid-cols-4 gap-10 mt-10 ${data.results?.length === 0 && "-mb-12"}`}>
            {data.results?.length === 0 && (
              <>
                <Skeleton />
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </>
            )}
            {data.results?.slice(0, 4).map((item) => (
              <a key={item.id} href={`/movie/${item.id}`} className="inline-block">
                <Tooltip target=".tooltip-target" position="top" />
                {item.poster_path ? (
                  <>
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      data-pr-tooltip={item.title}
                      alt={item.title}
                      className="tooltip-target rounded-2xl w-[260px] h-[390px]"
                    />
                  </>
                ) : (
                  <img
                    src={noImageAvailable}
                    alt={item.title}
                    data-pr-tooltip={item.title}
                    className="tooltip-target rounded-2xl w-[260px] h-[390px]"
                  />
                )}
              </a>
            ))}
          </div>
        </div>
      </Body>
    </div>
  );
}
