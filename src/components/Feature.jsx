import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegistration } from "../context/RegistrationContext";

function Feature() {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();
  const { addToCart, currentUser, getCart } = useRegistration();
  const cart = getCart();

  function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex !== 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
  }

  function loadMovie(id) {
    navigate(`/movies/${id}`);
  }

  const handleAddToCart = (movie) => {
    if (!currentUser) {
      alert("You need to be logged in to add movies to your cart.");
      return;
    }
    addToCart(movie);
  };
  const isMovieInCart = (movieId) => {
    return cart.some((item) => item.id === movieId);
  };

  useEffect(() => {
    (async function getMovies() {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${import.meta.env.VITE_TMDB_KEY}`
      );
      const moviesList = [];
      shuffle(response.data.results);
      for (let i = 0; i < 10; i++) {
        moviesList.push(response.data.results.pop());
      }
      setMovies(moviesList);
    })();
  }, []);

  return (
    <div>
      <div className="section_title">Featured</div>
      <div className="featured">
        {movies.map((movie) => (
          <div className="poster" key={movie.id}>
            <img
              src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
              alt="Movie poster"
              className="posterPicture"
              onClick={() => loadMovie(movie.id)}
            />
            <button
              className="buy-button"
              onClick={() => handleAddToCart(movie)}
            >
              {isMovieInCart(movie.id) ? "Added" : "Buy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feature;