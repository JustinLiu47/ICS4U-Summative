import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, firestore } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
    localStorage.setItem('authState', JSON.stringify(payload));
  };

  const setCart = (cart) => {
    dispatch({ type: 'SET_CART', payload: cart });
    localStorage.setItem('cart', JSON.stringify(cart));
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
      });
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
          purchaseHistory: [],
        });
      }
      const userData = userDoc.exists() ? userDoc.data() : {};

      setAuthState({
        isLoggedIn: true,
        currentUser: { ...user, ...userData },
        errorMessage: '',
        selectedGenres: userData.selectedGenres || [],
        purchasedMovies: Map(userData.purchaseHistory.map(id => [id, true])),
      });
    } catch (error) {
      console.error('Google login error:', error.message);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await fetchUserDetails(user);
        setAuthState({
          isLoggedIn: true,
          currentUser: { ...user, ...userData },
          errorMessage: '',
          selectedGenres: userData.selectedGenres || [],
          purchasedMovies: Map(userData.purchaseHistory.map(id => [id, true])), // Set purchasedMovies on auth state change
        });
      } else {
        setAuthState({
          isLoggedIn: false,
          currentUser: null,
          errorMessage: '',
          selectedGenres: [],
          purchasedMovies: Map(),
        });
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
        updateGenre,
        isMoviePurchased,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => useContext(ApplicationContext);