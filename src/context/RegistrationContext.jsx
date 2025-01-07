import React, { createContext, useState, useContext } from 'react';

const RegistrationContext = createContext();

export const useRegistration = () => useContext(RegistrationContext);

export const RegistrationProvider = ({ children }) => {
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cart, setCart] = useState([]);

  const registerUser = (user) => {
    if (registeredUsers.some((u) => u.email === user.email)) {
      setErrorMessage('This email is already registered.');
      return false;
    }
    const newUser = { ...user, cart: [], selectedGenres };
    setRegisteredUsers([...registeredUsers, newUser]);
    setErrorMessage('');
    return true;
  };

  const loginUser = (email, password) => {
    const user = registeredUsers.find((u) => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setErrorMessage('');
      return true;
    } else {
      setErrorMessage('Invalid email or password.');
      return false;
    }
  };

  const updateUserDetails = (updatedUser) => {
    if (
      currentUser?.firstName === updatedUser.firstName &&
      currentUser?.lastName === updatedUser.lastName &&
      JSON.stringify(currentUser?.selectedGenres) === JSON.stringify(updatedUser.selectedGenres)
    ) {
      return;
    }

    const updatedUsers = registeredUsers.map((user) =>
      user.email === updatedUser.email ? { ...user, ...updatedUser } : user
    );

    setRegisteredUsers(updatedUsers);
    setCurrentUser(updatedUser);

    alert("Profile updated successfully!");
  };

  const handleSubmit = async (event) => {
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
    };
  
    const success = registerUser(user);
    if (!success) {
      return false;
    }
  
    setErrorMessage('');
    return true;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'firstName') setFirstName(value);
    if (name === 'lastName') setLastName(value);
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
    if (name === 'confirmPassword') setConfirmPassword(value);
  };

  const handleGenreChange = (id) => {
    setSelectedGenres((prevSelectedGenres) =>
      prevSelectedGenres.includes(id)
        ? prevSelectedGenres.filter((genreId) => genreId !== id)
        : [...prevSelectedGenres, id]
    );
  };

  const addToCart = (movie) => {
    if (!currentUser) {
      setErrorMessage('You need to be logged in to add items to the cart.');
      return;
    }
    const updatedCart = [...(currentUser.cart || []), movie];
    setCart(updatedCart);
    const updatedUser = { ...currentUser, cart: updatedCart };
    setCurrentUser(updatedUser);
    updateUserDetails(updatedUser);
  };

  const removeFromCart = (movieId) => {
    if (!currentUser) {
      setErrorMessage('You need to be logged in to remove items from the cart.');
      return;
    }
    const updatedCart = (currentUser.cart || []).filter((movie) => movie.id !== movieId);
    setCart(updatedCart);
    const updatedUser = { ...currentUser, cart: updatedCart };
    setCurrentUser(updatedUser);
    updateUserDetails(updatedUser);
  };

  const getCart = () => {
    return currentUser ? currentUser.cart || [] : [];
  };

  const isMovieInCart = (movieId) => {
    return currentUser?.cart?.some((movie) => movie.id === movieId) || false;
  };

  return (
    <RegistrationContext.Provider
      value={{
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        selectedGenres,
        errorMessage,
        currentUser,
        cart,
        handleInputChange,
        handleGenreChange,
        handleSubmit,
        loginUser,
        updateUserDetails,
        addToCart,
        removeFromCart,
        getCart,
        isMovieInCart,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};
