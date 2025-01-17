import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';

const ApplicationContext = createContext();

const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const login = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setIsLoggedIn(true);
        setCurrentUser(userCredential.user);
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  const logout = () => {
    signOut(auth).then(() => {
      setIsLoggedIn(false);
      setCurrentUser(null);
    });
  };

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        setIsLoggedIn(true);
        setCurrentUser(result.user);
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  return {
    isLoggedIn,
    currentUser,
    login,
    logout,
    loginWithGoogle,
  };
};

const useRegistration = () => {
  const [errorMessage, setErrorMessage] = useState('');

  const registerUser = async (user) => {
    try {
      await createUserWithEmailAndPassword(auth, user.email, user.password);
      const userId = auth.currentUser.uid;
      const userDocRef = doc(firestore, 'users', userId);

      const userData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        selectedGenres: user.selectedGenres || [],
        purchaseHistory: [],
      };

      await setDoc(userDocRef, userData);
    } catch (error) {
      setErrorMessage('Error registering user: ' + error.message);
    }
  };

  const loginUser = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const userId = auth.currentUser.uid;
      const userDocRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        return null;
      }
    } catch (error) {
      setErrorMessage('Invalid email or password.');
      return null;
    }
  };

  return {
    registerUser,
    loginUser,
    errorMessage,
    setErrorMessage,
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

const handlePurchase = async (cart) => {
  const userId = auth.currentUser.uid;
  if (!cart || cart.length === 0) return;

  try {
    const purchaseData = {
      items: cart,
      purchaseDate: new Date(),
    };

    const userDocRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const updatedUser = { ...userData };
      updatedUser.purchaseHistory.push(purchaseData);

      await updateDoc(userDocRef, {
        purchaseHistory: updatedUser.purchaseHistory
      });

      localStorage.removeItem('cart');
    }
  } catch (error) {
    console.error('Error saving purchase history:', error);
  }
};

export const ApplicationProvider = ({ children }) => {
  const { isLoggedIn, currentUser, login, logout, loginWithGoogle } = useAuth();
  const { registerUser, loginUser, errorMessage, setErrorMessage } = useRegistration();
  const { selectedGenres, handleGenreChange } = useGenres();
  const { cart, addToCart, removeFromCart, getCart, isMovieInCart } = useCart();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user);
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    });
  }, []);

  const updateUserDetails = async (updatedUser) => {
    const userId = auth.currentUser.uid;
    const userDocRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const updatedUserData = {
        ...userDoc.data(),
        ...updatedUser,
      };

      await updateDoc(userDocRef, updatedUserData);
    }
  };

  return (
    <ApplicationContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        selectedGenres,
        errorMessage,
        setErrorMessage,
        cart,
        login,
        logout,
        loginWithGoogle,
        registerUser,
        loginUser,
        updateUserDetails,
        handlePurchase,
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