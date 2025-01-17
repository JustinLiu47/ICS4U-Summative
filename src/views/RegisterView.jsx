import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function RegisterView() {
  const navigate = useNavigate();
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    errorMessage,
    handleInputChange,
    handleGenreChange,
    handleSubmit,
    loginWithGoogle,
    selectedGenres
  } = useApplicationContext();

  const [isGoogleRegister, setIsGoogleRegister] = useState(false);

  const enhancedHandleSubmit = async (event) => {
    event.preventDefault();

    if (isGoogleRegister) {
      const registrationSuccess = await handleSubmit(event, firstName, lastName, email, '', '');
      if (registrationSuccess) {
        navigate('/login');
      }
    } else {
      const registrationSuccess = await handleSubmit(event, firstName, lastName, email, password, confirmPassword);
      if (registrationSuccess) {
        navigate('/login');
      }
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle();
      setIsGoogleRegister(true);
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  return (
    <div className="register-container">
      <Header />
      <div className="form-container">
        <h2>Create an Account</h2>
        
        {!isGoogleRegister && (
          <button className="google-register-button" onClick={handleGoogleRegister}>
            Register with Google
          </button>
        )}

        <form onSubmit={enhancedHandleSubmit}>
          {!isGoogleRegister && (
            <>
              <label htmlFor="first-name">First Name</label>
              <input
                type="text"
                id="first-name"
                name="firstName"
                value={firstName}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="last-name">Last Name</label>
              <input
                type="text"
                id="last-name"
                name="lastName"
                value={lastName}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleInputChange}
                required
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
                />
                {genre}
              </label>
            ))}
          </div>

          {errorMessage && <p className="error">{errorMessage}</p>}

          <button type="submit" className="register-button">Register</button>
        </form>

        <p className="login-link">
          Already have an account?
          <span className="login-link-text" onClick={() => navigate('/login')}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default RegisterView;