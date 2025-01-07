import { useNavigate } from "react-router-dom";
function Genres(props) {
  const navigate = useNavigate();

  const handleGenreClick = (genreId) => {
      navigate(`/movies/genre/${genreId}`);
    }

  return (
    <div className="genres-container">
      <h2 className="section-title">Browse by Genre</h2>
      <ul className="genres-list">
        {props.genreList.map((genre) => (
          <li
            key={genre.id}
            onClick={() => handleGenreClick(genre.id)}
            className="genre-item"
          >
            {genre.genre}
          </li>
        ))}
      </ul>
    </div>
  )
}

  export default Genres;