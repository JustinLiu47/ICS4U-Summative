import React, { useState, useEffect } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useApplicationContext } from '../context/ApplicationContext';

function DetailView() {
  const [movie, setMovie] = useState({});
  const [error, setError] = useState(null);
  const params = useParams();
  const navigate = useNavigate();
  const { addToCart, currentUser, cart, isMoviePurchased } = useApplicationContext();

  useEffect(() => {
    const getMovie = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${params.id}?api_key=${import.meta.env.VITE_TMDB_KEY}&append_to_response=videos`
        );
        setMovie(response.data);
      } catch (err) {
        setError("Failed to fetch movie details. Please try again later.");
        console.error(err);
      }
    };

    getMovie();
  }, [params.id]);

  const handleAddToCart = () => {
    if (!currentUser) {
      alert('You need to be logged in to add movies to your cart.');
      return;
    }
    if (isMoviePurchased(movie.id)) {
      alert("You've already purchased this movie.");
      return;
    }
    addToCart(movie);
  };

  const isMovieInCart = (movieId) => {
    return Array.isArray(cart) && cart.some((item) => item.id === movieId);
  };

  const handleGoToCart = () => {
    navigate("/cart");
  };

  return (
    <div className="movie-detail">
      {error && <p className="error-message">{error}</p>}

      {!error && movie && (
        <>
          <h1 className="movie-title">{movie.original_title}</h1>
          <button
            className="buy-button-detail"
            onClick={handleAddToCart}
            disabled={isMovieInCart(movie.id) || isMoviePurchased(movie.id)}
          >
            {isMoviePurchased(movie.id) ? 'Purchased' : isMovieInCart(movie.id) ? 'Added' : 'Buy'}
          </button>

          {isMovieInCart(movie.id) && (
            <button className="go-to-cart-button" onClick={handleGoToCart}>
              Go to Cart
            </button>
          )}

          <p className="movie-overview">{movie.overview}</p>
          <div className="movie-info">
            <p><strong>Release Date:</strong> {movie.release_date}</p>
            <p><strong>Runtime:</strong> {movie.runtime} minutes</p>
            <p><strong>Popularity:</strong> {movie.popularity}</p>
          </div>

          <div className="poster-section">
            {movie.poster_path ? (
              <img
                className="movie-poster"
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.original_title}
              />
            ) : (
              <img
                className="movie-poster"
                src="https://via.placeholder.com/500x750?text=No+Poster"
                alt="No poster available"
              />
            )}
          </div>

          <div className="trailers-section">
            <h2>Trailers</h2>
            <div className="trailers-grid">
              {movie.videos &&
                movie.videos.results.map((trailer) => (
                  <div key={trailer.id} className="trailer-tile">
                    <a
                      href={`https://www.youtube.com/watch?v=${trailer.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        className="trailer-thumbnail"
                        src={`https://img.youtube.com/vi/${trailer.key}/0.jpg`}
                        alt={trailer.name}
                      />
                      <h3>{trailer.name}</h3>
                    </a>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DetailView;