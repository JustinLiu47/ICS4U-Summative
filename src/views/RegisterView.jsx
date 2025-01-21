import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import Header from "../components/Header";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

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

function RegisterView() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    selectedGenres: [],
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isRegisteringWithGoogle, setIsRegisteringWithGoogle] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (id) => {
    setFormData((prev) => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(id)
        ? prev.selectedGenres.filter((genreId) => genreId !== id)
        : [...prev.selectedGenres, id],
    }));
  };

  const validateGenres = () => {
    if (formData.selectedGenres.length < 10) {
      setErrorMessage("Please select at least 10 genres to proceed.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { firstName, lastName, email, password, confirmPassword, selectedGenres } = formData;

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (!validateGenres()) {
      return;
    }

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setErrorMessage("This email is already registered. Please use a different email.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: `${firstName} ${lastName}` });

      await setDoc(doc(firestore, "users", user.uid), {
        firstName,
        lastName,
        email,
        selectedGenres,
        purchaseHistory: [],
      });

      setSuccessMessage("Registration successful! Redirecting to login page...");
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Registration error:', error.message);
      setErrorMessage(error.message);
    }
  };

  const handleGoogleRegister = async () => {
    if (!validateGenres()) {
      return;
    }

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const signInMethods = await fetchSignInMethodsForEmail(auth, user.email);
      if (signInMethods.length > 0) {
        setErrorMessage("This Google account is already registered. Please log in.");
        return;
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ')[1] || '',
          email: user.email,
          selectedGenres: formData.selectedGenres,
          purchaseHistory: [],
        });
      }

      setSuccessMessage("Registration successful! Redirecting to login page...");
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Google registration error:', error.message);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="register-container">
      <Header />
      <div className="form-container">
        <h2>Create an Account</h2>

        <div className="register-method-buttons">
          <button className="google-register-button" onClick={() => setIsRegisteringWithGoogle(true)}>
            <FontAwesomeIcon icon={faGoogle} size="lg" />
            <span>Register with Google</span>
          </button>

          <button className="google-register-button" onClick={() => setIsRegisteringWithGoogle(false)}>
            <FontAwesomeIcon icon={faEnvelope} size="lg" />
            <span>Register with Email</span>
          </button>
        </div>

        <h2>Select Genres</h2>
        <div id="genre-div" className="genre-div">
          {genreList.map(({ id, genre }) => (
            <label key={id}>
              <input
                type="checkbox"
                name="genre"
                value={id}
                onChange={() => handleGenreChange(id)}
                checked={formData.selectedGenres.includes(id)}
              />
              {genre}
            </label>
          ))}
        </div>

        {isRegisteringWithGoogle ? (
          <button className="register-button" onClick={handleGoogleRegister}>
            Register with Google
          </button>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="first-name">First Name</label>
            <input
              type="text"
              id="first-name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="last-name">Last Name</label>
            <input
              type="text"
              id="last-name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />

            <button type="submit" className="register-button">
              Register
            </button>
          </form>
        )}

        {errorMessage && <p className="error">{errorMessage}</p>}
        {successMessage && <p className="success">{successMessage}</p>}

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