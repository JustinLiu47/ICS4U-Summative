import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import Header from "../components/Header";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

function LoginView() {
  const email = useRef('');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') {
      setPassword(value);
    }
  };

  const emailLogIn = async (event) => {
    event.preventDefault();
    if (!email.current.value || !password) {
      setErrorMessage("Please provide both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.current.value, password);
      const user = userCredential.user;

      navigate('/');
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          setErrorMessage("No user found with this email. Please check your email or register.");
          break;
        case "auth/wrong-password":
          setErrorMessage("Incorrect password. Please try again.");
          break;
        case "auth/invalid-email":
          setErrorMessage("The email address is not valid. Please check and try again.");
          break;
        case "auth/invalid-credential":
          setErrorMessage("No user/password combination found. Please check your email and password or register.");
          break;
        default:
          console.error("Unexpected error code:", error.code);
          setErrorMessage(`An unexpected error occurred: ${error.message}`);
      }
    }
  };

  const loginByGoogle = async () => {
    try {
      const user = (await signInWithPopup(auth, new GoogleAuthProvider())).user;

      navigate('/');
    } catch (error) {
      console.error('Google login error: ', error.message);
      setErrorMessage("Error signing in with Google!");
    }
  };

  return (
    <div className="login-container">
      <Header />
      <div className="form-container">
        <h2>Login to Your Account</h2>

        <button className="google-register-button" onClick={loginByGoogle}>
          <FontAwesomeIcon icon={faGoogle} size="lg" />
          <span>Login with Google</span>
        </button>

        <form onSubmit={emailLogIn}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            ref={email}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={handleInputChange}
            required
          />

          {errorMessage && <p className="error">{errorMessage}</p>}

          <button type="submit" className="login-button">Login</button>
        </form>

        <p className="register-link">
          New to Netflix?{' '}
          <span className="register-link-text" onClick={() => navigate('/register')}>
            Register now
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginView;