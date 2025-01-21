import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, updateProfile, updatePassword } from 'firebase/auth';
import { auth, firestore } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Map } from 'immutable';

const initialState = {
  isLoggedIn: false,
  currentUser: null,
  errorMessage: '',
  cart: [],
  purchasedMovies: Map(),
  selectedGenres: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_AUTH_STATE':
      return { ...state, ...action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'SET_PURCHASED_MOVIES':
      return { ...state, purchasedMovies: action.payload };
    case 'SET_ERROR_MESSAGE':
      return { ...state, errorMessage: action.payload };
    default:
      return state;
  }
};

const ApplicationContext = createContext();

export const ApplicationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setAuthState = (payload) => {
    dispatch({ type: 'SET_AUTH_STATE', payload });
    localStorage.setItem('authState', JSON.stringify(payload));  // Persist state in localStorage
  };

  const setCart = (cart) => {
    dispatch({ type: 'SET_CART', payload: cart });
    localStorage.setItem('cart', JSON.stringify(cart));  // Persist cart in localStorage
  };

  const setPurchasedMovies = (purchasedMovies) => {
    dispatch({ type: 'SET_PURCHASED_MOVIES', payload: purchasedMovies });
    localStorage.setItem('purchasedMovies', JSON.stringify([...purchasedMovies]));  // Persist purchased movies
  };

  const addToCart = (movie) => {
    const updatedCart = [...state.cart, movie];
    setCart(updatedCart);
  };

  const getCart = () => {
    return state.cart;
  };

  const isMoviePurchased = (movieId) => {
    return state.purchasedMovies.has(movieId);
  };

  const removeFromCart = (movieId) => {
    const updatedCart = state.cart.filter((movie) => movie.id !== movieId);
    setCart(updatedCart);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAuthState({
        isLoggedIn: false,
        currentUser: null,
        errorMessage: '',
        selectedGenres: [],
        purchasedMovies: Map(),
        cart: [],
      });
      localStorage.removeItem('cart');  // Clear cart from localStorage on logout
      localStorage.removeItem('purchasedMovies');  // Clear purchased movies from localStorage on logout
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  const loginWithGoogle = async () => {
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
          purchasedMovies: [],
        });
      }
      const userData = userDoc.exists() ? userDoc.data() : {};

      setAuthState({
        isLoggedIn: true,
        currentUser: { ...user, ...userData },
        errorMessage: '',
        selectedGenres: userData.selectedGenres || [],
      });
      setPurchasedMovies(Map((userData.purchasedMovies || []).map(id => [id, true]))); // Ensure purchasedMovies is an array
    } catch (error) {
      console.error('Google login error:', error.message);
      setAuthState({ errorMessage: error.message });
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      setAuthState({
        isLoggedIn: true,
        currentUser: { ...user, ...userData },
        errorMessage: '',
        selectedGenres: userData.selectedGenres || [],
      });
      setPurchasedMovies(Map((userData.purchasedMovies || []).map(id => [id, true]))); // Ensure purchasedMovies is an array
    } catch (error) {
      console.error('Email login error:', error.message);
      setAuthState({ errorMessage: error.message });
    }
  };

  const updateGenre = async (genre) => {
    try {
      const updatedGenres = state.genreList.map((item) =>
        item.id === genre.id ? { ...item, selected: !item.selected } : item
      );

      if (state.currentUser) {
        const selectedGenreIds = updatedGenres
          .filter((g) => g.selected)
          .map((g) => g.id);

        const userDocRef = doc(firestore, 'users', state.currentUser.uid);
        await updateDoc(userDocRef, { selectedGenres: selectedGenreIds });

        setAuthState({
          ...state,
          selectedGenres: selectedGenreIds,
        });
      }

      dispatch({ type: 'SET_AUTH_STATE', payload: { genreList: updatedGenres } });
    } catch (error) {
      console.error('Failed to update genres:', error.message);
    }
  };

  const fetchUserDetails = async (user) => {
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error fetching user details:', error.message);
      return null;
    }
  };

  const getPastPurchases = async (userId) => {
    try {
      const userDocRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      return userData.purchasedMovies || [];
    } catch (error) {
      console.error('Error fetching past purchases:', error.message);
      return [];
    }
  };

  const updateUserDetails = async (details) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user found");

      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        firstName: details.firstName,
        lastName: details.lastName,
        selectedGenres: details.selectedGenres,
      });

      if (details.password) {
        await updatePassword(user, details.password);
      }

      await updateProfile(user, {
        displayName: `${details.firstName} ${details.lastName}`,
      });

      setAuthState({
        ...state,
        currentUser: {
          ...state.currentUser,
          firstName: details.firstName,
          lastName: details.lastName,
          selectedGenres: details.selectedGenres,
        },
      });
    } catch (error) {
      console.error('Error updating user details:', error.message);
      throw error;
    }
  };

  const handleCheckout = async () => {
    if (!state.currentUser) {
      alert('You need to be logged in to complete the purchase.');
      return;
    }

    try {
      const userRef = doc(firestore, 'users', state.currentUser.uid);
      const purchasedMovies = state.cart.map((movie) => movie.id);

      await updateDoc(userRef, {
        purchasedMovies: arrayUnion(...purchasedMovies),
      });

      const updatedPurchasedMovies = Map([...state.purchasedMovies, ...purchasedMovies.map(id => [id, true])]);
      setPurchasedMovies(updatedPurchasedMovies);
      setCart([]);
      alert('Thank you for your purchase!');
    } catch (error) {
      console.error("Error during checkout:", error);
      alert('An error occurred during checkout. Please try again.');
    }
  };

  // Check for the persisted state in localStorage when the app loads
  useEffect(() => {
    const storedAuthState = localStorage.getItem('authState');
    const storedCart = localStorage.getItem('cart');
    const storedPurchasedMovies = localStorage.getItem('purchasedMovies');
    if (storedAuthState) {
      const authState = JSON.parse(storedAuthState);
      if (authState.isLoggedIn && authState.currentUser) {
        console.log("Loaded authState from localStorage:", authState);
        setAuthState(authState);
        setPurchasedMovies(Map((authState.currentUser.purchasedMovies || []).map(id => [id, true])));
      }
    }
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    if (storedPurchasedMovies) {
      setPurchasedMovies(Map(JSON.parse(storedPurchasedMovies)));
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await fetchUserDetails(user);
        if (userData) {
          console.log("Auth state changed: User logged in:", userData);
          setAuthState({
            isLoggedIn: true,
            currentUser: { ...user, ...userData },
            errorMessage: '',
            selectedGenres: userData.selectedGenres || [],
          });
          setPurchasedMovies(Map((userData.purchasedMovies || []).map(id => [id, true])));
        }
      } else {
        console.log("Auth state changed: No user is logged in");
        setAuthState({
          isLoggedIn: false,
          currentUser: null,
          errorMessage: '',
          selectedGenres: [],
          purchasedMovies: Map(),
          cart: [],
        });
        localStorage.removeItem('cart');  // Clear cart from localStorage on logout
        localStorage.removeItem('purchasedMovies');  // Clear purchased movies from localStorage on logout
      }
    });

    return unsubscribe;
  }, []);

  return (
    <ApplicationContext.Provider
      value={{
        ...state,
        setAuthState,
        setCart,
        addToCart,
        getCart,
        removeFromCart,
        logout,
        loginWithGoogle,
        loginWithEmail,
        updateGenre,
        isMoviePurchased,
        handleCheckout,
        getPastPurchases,  // Provide getPastPurchases in the context
        updateUserDetails,  // Provide updateUserDetails in the context
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => useContext(ApplicationContext);