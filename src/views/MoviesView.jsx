import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Genres from "../components/Genres";
import { useRegistration } from "../context/RegistrationContext";

function MoviesView() {
  const { selectedGenres } = useRegistration();

  const genreList = [
    { genre: "Action", id: 28 },
    { genre: "Family", id: 10751 },
    { genre: "Science Fiction", id: 878 },
    { genre: "Adventure", id: 12 },
    { genre: "Fantasy", id: 14 },
    { genre: "Animation", id: 16 },
    { genre: "History", id: 36 },
    { genre: "Thriller", id: 53 },
    { genre: "Comedy", id: 35 },
    { genre: "Horror", id: 27 },
    { genre: "War", id: 10752 },
    { genre: "Crime", id: 80 },
    { genre: "Music", id: 10402 },
    { genre: "Western", id: 37 },
    { genre: "Documentary", id: 99 },
    { genre: "Mystery", id: 9648 },
    { genre: "Drama", id: 18 },
    { genre: "Romance", id: 10749 }
  ];

  const filteredGenres = genreList.filter(genre =>
    selectedGenres.includes(genre.id)
  );

  return (
    <div className="movies-view-container">
      <Header />
      <div className="movies-content">
        <div className="genres-sidebar">
          <Genres genreList={filteredGenres} />
        </div>
        <div className="movie-detail-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MoviesView;