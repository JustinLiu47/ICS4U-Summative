import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import { useAuth } from '../context/AuthContext';
import Header from "../components/Header";

function LoginView() {
  const navigate = useNavigate();
  const { loginUser, errorMessage } = useRegistration();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    } else if (name === 'firstName') {
      setFirstName(value);
    } else if (name === 'lastName') {
      setLastName(value);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      alert("All fields are required.");
      return;
    }

    const success = await loginUser(email, password);

    if (success) {
      login();

      navigate('/');
    } else {
      alert("Invalid login credentials. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <Header />
      <div className="form-container">
        <h2>Login to Your Account</h2>
        <form onSubmit={handleLogin}>
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