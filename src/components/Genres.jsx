import React from 'react';
import { useNavigate } from "react-router-dom";
import { useApplicationContext } from '../context/ApplicationContext';

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
  { genre: "Romance", id: 10749 },
];

function Genres() {
  const navigate = useNavigate();
  const { selectedGenres } = useApplicationContext();

  const handleGenreClick = (genreId) => {
    navigate(`/movies/genre/${genreId}`);
  };

  const getGenreName = (id) => {
    const genre = genreList.find((g) => g.id === id);
    return genre ? genre.genre : "Unknown Genre";
  };

  return (
    <div className="genres-container">
      <h2 className="section-title">Browse by Genre</h2>
      <ul className="genres-list">
        {selectedGenres.map((genreId) => (
          <li
            key={genreId}
            onClick={() => handleGenreClick(genreId)}
            className="genre-item"
          >
            {getGenreName(genreId)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Genres;