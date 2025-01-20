import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, updatePassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';

const ApplicationContext = createContext();

const useAuth = () => {
  const [authState, setAuthState] = useState(() => {
    const storedAuthState = localStorage.getItem('authState');
    return storedAuthState ? JSON.parse(storedAuthState) : { isLoggedIn: false, currentUser: null, errorMessage: '' };
  });

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const updatedState = {
        isLoggedIn: true,
        currentUser: userCredential.user,
        errorMessage: '',
      };
      setAuthState(updatedState);
      localStorage.setItem('authState', JSON.stringify(updatedState));
    } catch (error) {
      console.error('Login error: ', error.message);
      setAuthState({
        ...authState,
        errorMessage: `Error: ${error.message}`,
      });
    }
  };

  const logout = () => {
    signOut(auth)
      .then(() => {
        const updatedState = {
          isLoggedIn: false,
          currentUser: null,
          errorMessage: '',
        };
        setAuthState(updatedState);
        localStorage.removeItem('authState');
      })
      .catch((error) => {
        console.error('Logout error: ', error.message);
        setAuthState({
          ...authState,
          errorMessage: `Error: ${error.message}`,
        });
      });
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const updatedState = {
        isLoggedIn: true,
        currentUser: result.user,
        errorMessage: '',
      };
      setAuthState(updatedState);
      localStorage.setItem('authState', JSON.stringify(updatedState));

      const userDocRef = doc(firestore, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          firstName: result.user.displayName?.split(' ')[0] || '',
          lastName: result.user.displayName?.split(' ')[1] || '',
          email: result.user.email,
          selectedGenres: [],
          purchaseHistory: [],
        });
      }
    } catch (error) {
      console.error('Google login error: ', error.message);
      setAuthState({
        ...authState,
        errorMessage: `Error: ${error.message}`,
      });
    }
  };

  return {
    authState,
    setAuthState,
    login,
    logout,
    loginWithGoogle,
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

const useRegistration = () => {
  const [isRegisteringWithGoogle, setIsRegisteringWithGoogle] = useState(false);

  const registerUser = async (user) => {
    try {
      if (isRegisteringWithGoogle) {
        const userCredential = await signInWithPopup(auth, new GoogleAuthProvider());
        const userId = userCredential.user.uid;
        const userDocRef = doc(firestore, 'users', userId);

        const userData = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: userCredential.user.email,
          selectedGenres: user.selectedGenres || [],
          purchaseHistory: [],
        };

        await setDoc(userDocRef, userData);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
        const userId = userCredential.user.uid;
        const userDocRef = doc(firestore, 'users', userId);

        const userData = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          selectedGenres: user.selectedGenres || [],
          purchaseHistory: [],
        };

        await setDoc(userDocRef, userData);
      }
      return true;
    } catch (error) {
      console.error('Registration error: ', error.message);
      return false;
    }
  };

  return {
    registerUser,
    isRegisteringWithGoogle,
    setIsRegisteringWithGoogle,
  };
};

const useCart = () => {
  const [cart, setCart] = useState(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    return storedCart;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const getCart = () => {
    return cart;
  };

  const removeFromCart = (movieId) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== movieId);
      return updatedCart;
    });
  };

  const isMoviePurchased = (movieId) => {
    const purchasedMovies = JSON.parse(localStorage.getItem('purchasedMovies')) || [];
    return purchasedMovies.includes(movieId);
  };

  const addToCart = (movie) => {
    if (isMoviePurchased(movie.id)) {
      alert("You've already purchased this movie.");
      return;
    }

    setCart((prevCart) => [...prevCart, movie]);
  };

  return {
    cart,
    getCart,
    removeFromCart,
    isMoviePurchased,
    addToCart,
  };
};

const useUserDetails = () => {
  const updateUserDetails = async (userData) => {
    const userDocRef = doc(firestore, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        selectedGenres: userData.selectedGenres,
        password: userData.password || currentUser.password,
      });
      setAuthState({
        ...authState,
        currentUser: {
          ...currentUser,
          ...userData,
        },
      });
    } catch (error) {
      console.error("Error updating user details: ", error);
      setAuthState({
        ...authState,
        errorMessage: `Error: ${error.message}`,
      });
    }
  };
  
  const getPastPurchases = async (userId) => {
    const userDocRef = doc(firestore, 'users', userId);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        return docSnap.data().purchaseHistory || [];
      } else {
        console.error("No user document found!");
        return [];
      }
    } catch (error) {
      console.error("Error fetching past purchases: ", error);
      return [];
    }
  };

  return {
    updateUserDetails,
    getPastPurchases,
  };
};

export const ApplicationProvider = ({ children }) => {
  const { authState, setAuthState, login, logout, loginWithGoogle } = useAuth();
  const { selectedGenres, handleGenreChange } = useGenres();
  const { registerUser, isRegisteringWithGoogle, setIsRegisteringWithGoogle } = useRegistration();
  const { cart, addToCart, removeFromCart } = useCart();
  const { updateUserDetails, getPastPurchases } = useUserDetails();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
    selectedGenres: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setAuthState({
        ...authState,
        errorMessage: 'Passwords do not match.',
      });
      return;
    }

    const user = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      selectedGenres: formData.selectedGenres,
    };

    const success = await registerUser(user);

    if (success) {
    } else {
      setAuthState({
        ...authState,
        errorMessage: 'Registration failed. Please try again.',
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const updatedState = {
          isLoggedIn: true,
          currentUser: user,
          errorMessage: '',
        };
        setAuthState(updatedState);
        localStorage.setItem('authState', JSON.stringify(updatedState));
      } else {
        setAuthState({
          isLoggedIn: false,
          currentUser: null,
          errorMessage: '',
        });
        localStorage.removeItem('authState');
      }
    });

    return unsubscribe;
  }, [setAuthState]);

  return (
    <ApplicationContext.Provider
      value={{
        authState,
        setAuthState,
        selectedGenres,
        handleGenreChange,
        login,
        logout,
        loginWithGoogle,
        handleInputChange,
        formData,
        handleSubmit,
        isRegisteringWithGoogle,
        setIsRegisteringWithGoogle,
        cart,
        addToCart,
        removeFromCart,
        updateUserDetails,
        getPastPurchases,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => useContext(ApplicationContext);