import React, { useState, useEffect } from 'react';
import { useApplicationContext } from '../context/ApplicationContext';
import Header from "../components/Header";

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

function SettingsView() {
  const { currentUser, updateUserDetails, getPastPurchases } = useApplicationContext();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pastPurchases, setPastPurchases] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("SettingsView useEffect triggered");

    if (!currentUser) {
      console.log("No current user found, checking localStorage...");
      
      const storedAuthState = localStorage.getItem('authState');
      if (storedAuthState) {
        const authStateFromLocalStorage = JSON.parse(storedAuthState);
        setFirstName(authStateFromLocalStorage.currentUser?.firstName || '');
        setLastName(authStateFromLocalStorage.currentUser?.lastName || '');
        setSelectedGenres(authStateFromLocalStorage.currentUser?.selectedGenres || []);
      }

      setLoading(false);
      return;
    }

    console.log("Current user:", currentUser);
    setFirstName(currentUser.firstName || '');
    setLastName(currentUser.lastName || '');
    setSelectedGenres(currentUser.selectedGenres || []);

    getPastPurchases(currentUser.uid)
      .then((purchases) => {
        console.log("Past purchases:", purchases);
        setPastPurchases(purchases);
      })
      .catch((err) => {
        console.error("Failed to fetch purchases:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser, getPastPurchases]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (currentUser && currentUser.email) {
      const updatedDetails = {
        firstName,
        lastName,
        email: currentUser.email,
        selectedGenres,
      };

      if (password) {
        updatedDetails.password = password;
      }

      try {
        await updateUserDetails(updatedDetails);
        alert("Profile updated successfully!");
      } catch (error) {
        console.error("Failed to update profile:", error);
        alert("Failed to update profile. Please try again.");
      }
    }
  };

  const handleGenreChange = (id) => {
    setSelectedGenres((prevSelectedGenres) =>
      prevSelectedGenres.includes(id)
        ? prevSelectedGenres.filter((genreId) => genreId !== id)
        : [...prevSelectedGenres, id]
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <div>No user data available. Please log in.</div>;
  }

  const isGoogleUser = currentUser.providerData.some(
    (provider) => provider.providerId === 'google.com'
  );

  return (
    <div>
      <Header />
      <div className="profile-container">
        <h2>Update Profile</h2>
        <form onSubmit={handleSubmit}>
          <label>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            readOnly={isGoogleUser}
          />

          <label>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            readOnly={isGoogleUser}
          />

          {!isGoogleUser && (
            <>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </>
          )}

          <h2>Select Genres</h2>
          <div id="genre-div" className="genre-div">
            {genreList.map(({ id, genre }) => (
              <label key={id}>
                <input
                  type="checkbox"
                  name="genre"
                  value={id}
                  onChange={() => handleGenreChange(id)}
                  checked={selectedGenres.includes(id)}
                />
                {genre}
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="save-change-button"
            disabled={selectedGenres.length < 10}
          >
            Save Changes
          </button>
        </form>

        <h2>Your Past Purchases</h2>
        <div className="cart-grid">
          {pastPurchases.map((movie) => (
            <div key={movie.id} className="cart-item">
              <div className="movie-info">
                <h2 className="movie-title">{movie.title}</h2>
              </div>
              {movie.poster_path ? (
                <img
                  className="posterPicture"
                  src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                  alt={movie.title}
                />
              ) : (
                <img
                  className="posterPicture"
                  src="https://via.placeholder.com/200x300?text=No+Poster"
                  alt="No poster available"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SettingsView;