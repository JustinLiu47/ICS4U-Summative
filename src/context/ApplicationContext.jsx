import React, { createContext, useState, useContext } from 'react';

const ApplicationContext = createContext();

const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const login = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return {
    isLoggedIn,
    currentUser,
    login,
    logout,
  };
};

const useRegistration = () => {
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const registerUser = (user) => {
    if (registeredUsers.some((u) => u.email === user.email)) {
      setErrorMessage('This email is already registered.');
      return false;
    }
    setRegisteredUsers([...registeredUsers, user]);
    setErrorMessage('');
    return true;
  };

  const loginUser = (email, password) => {
    const user = registeredUsers.find((u) => u.email === email && u.password === password);
    if (user) {
      setErrorMessage('');
      return user;
    } else {
      setErrorMessage('Invalid email or password.');
      return null;
    }
  };

  return {
    registeredUsers,
    registerUser,
    loginUser,
    errorMessage,
  };
};

const useGenres = () => {
  const [selectedGenres, setSelectedGenres] = useState([]);

  const handleGenreChange = (id) => {
    setSelectedGenres((prevSelectedGenres) =>
      prevSelectedGenres.includes(id)
        ? prevSelectedGenres.filter((genreId) => genreId !== id)
        : [...prevSelectedGenres, id]
    );
  };

  return {
    selectedGenres,
    handleGenreChange,
  };
};

const useCart = () => {
  const [cart, setCart] = useState([]);

  const addToCart = (movie) => {
    setCart((prevCart) => [...prevCart, movie]);
  };

  const removeFromCart = (movieId) => {
    setCart((prevCart) => prevCart.filter((movie) => movie.id !== movieId));
  };

  const getCart = () => cart;

  const isMovieInCart = (movieId) => cart.some((movie) => movie.id === movieId);

  return {
    cart,
    addToCart,
    removeFromCart,
    getCart,
    isMovieInCart,
  };
};

export const ApplicationProvider = ({ children }) => {
  const { isLoggedIn, currentUser, login, logout } = useAuth();
  const { registeredUsers, registerUser, loginUser, errorMessage } = useRegistration();
  const { selectedGenres, handleGenreChange } = useGenres();
  const { cart, addToCart, removeFromCart, getCart, isMovieInCart } = useCart();

  const updateUserDetails = (updatedUser) => {
    const updatedUsers = registeredUsers.map((user) =>
      user.email === updatedUser.email ? { ...user, ...updatedUser } : user
    );
    setRegisteredUsers(updatedUsers);
  };

  const handleSubmit = async (event, firstName, lastName, email, password, confirmPassword) => {
    event.preventDefault();

    if (!firstName || !lastName || !email || !password) {
      setErrorMessage('All fields are required.');
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }

    if (selectedGenres.length < 10) {
      setErrorMessage('Please select at least 10 genres.');
      return false;
    }

    const user = {
      firstName,
      lastName,
      email,
      password,
      selectedGenres,
      cart: [],
    };

    const success = registerUser(user);
    if (!success) {
      return false;
    }

    setErrorMessage('');
    return true;
  };

  return (
    <ApplicationContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        selectedGenres,
        errorMessage,
        cart,
        login,
        logout,
        registerUser,
        loginUser,
        updateUserDetails,
        handleSubmit,
        handleGenreChange,
        addToCart,
        removeFromCart,
        getCart,
        isMovieInCart,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => useContext(ApplicationContext);