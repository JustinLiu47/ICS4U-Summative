import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useRegistration } from "../context/RegistrationContext";

function GenreView() {
    const [movies, setMovies] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const params = useParams();
    const navigate = useNavigate();
    const { addToCart, currentUser, getCart } = useRegistration();
    const cart = getCart();

    useEffect(() => {
        (async function getGenreMovies() {
            try {
                const response = await axios.get(
                    `https://api.themoviedb.org/3/discover/movie?with_genres=${params.id}&page=${currentPage}&api_key=${import.meta.env.VITE_TMDB_KEY}`
                );
                setMovies(response.data.results);
                setTotalPages(response.data.total_pages);
            } catch (error) {
                console.error("Error fetching movies: ", error);
            }
        })();
    }, [params.id, currentPage]);

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

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div>
            <h2>Movies in this Genre</h2>
            <div className="genre">
                {movies.length > 0 ? (
                    movies.map((movie) => (
                        movie.poster_path ? (
                            <div className="poster" key={movie.id}>
                                <img
                                    src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                                    alt={movie.title}
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
                        ) : null
                    ))
                ) : (
                    <p>No movies found for this genre.</p>
                )}
            </div>

            <div className="pagination">
                <button onClick={prevPage} disabled={currentPage === 1}>
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={nextPage} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
}

export default GenreView;