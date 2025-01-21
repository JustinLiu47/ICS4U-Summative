import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import Header from "../components/Header";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useApplicationContext } from '../context/ApplicationContext';

function LoginView() {
  const navigate = useNavigate();
  const { setAuthState } = useApplicationContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      alert("Email and password are required.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      const updatedState = {
        isLoggedIn: true,
        currentUser: { ...user, ...userData },
        errorMessage: '',
      };
      localStorage.setItem('authState', JSON.stringify(updatedState));
      setAuthState(updatedState);
      navigate('/');
    } catch (error) {
      console.error('Login error: ', error.message);
      setErrorMessage(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ')[1] || '',
          email: user.email,
          selectedGenres: [],
          purchaseHistory: [],
        });
      }
      const userData = userDoc.exists() ? userDoc.data() : {};

      const updatedState = {
        isLoggedIn: true,
        currentUser: { ...user, ...userData },
        errorMessage: '',
      };
      localStorage.setItem('authState', JSON.stringify(updatedState));
      setAuthState(updatedState);
      navigate('/');
    } catch (error) {
      console.error('Google login error: ', error.message);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="login-container">
      <Header />
      <div className="form-container">
        <h2>Login to Your Account</h2>

        <button className="google-register-button" onClick={handleGoogleLogin}>
          <FontAwesomeIcon icon={faGoogle} size="lg" />
          <span>Login with Google</span>
        </button>

        <form onSubmit={handleLogin}>
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

          {errorMessage && <p className="error">{errorMessage}</p>}

          <button type="submit" className="login-button">Login</button>
        </form>

        <p className="register-link">
          New to Netflix?
          <span className="register-link-text" onClick={() => navigate('/register')}>
            Register now
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginView;