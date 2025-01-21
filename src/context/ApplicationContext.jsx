import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, firestore } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Map } from 'immutable';

const ApplicationContext = createContext();

export const ApplicationProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const storedAuthState = localStorage.getItem('authState');
    return storedAuthState ? JSON.parse(storedAuthState) : { isLoggedIn: false, currentUser: null, errorMessage: '' };
  });

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(Map());
  const [purchasedMovies, setPurchasedMovies] = useState(Map());
  const [genreList, setGenreList] = useState([
    { name: "Action", id: 28, selected: false },
    { name: "Horror", id: 27, selected: false },
    { name: "TV", id: 10770, selected: false },
    { name: "Crime", id: 80, selected: false },
    { name: "Adventure", id: 12, selected: false },
    { name: "Family", id: 10751, selected: false },
    { name: "Music", id: 10402, selected: false },
    { name: "Thriller", id: 53, selected: false },
    { name: "Animation", id: 16, selected: false },
    { name: "Fantasy", id: 14, selected: false },
    { name: "Mystery", id: 9648, selected: false },
    { name: "War", id: 10752, selected: false },
  ]);

  const logout = async () => {
    await signOut(auth);
    const updatedState = {
      isLoggedIn: false,
      currentUser: null,
      errorMessage: '',
    };
    setAuthState(updatedState);
    localStorage.removeItem('authState');
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

      const updatedState = {
        isLoggedIn: true,
        currentUser: { ...user, ...userData },
        errorMessage: '',
      };
      localStorage.setItem('authState', JSON.stringify(updatedState));
      setAuthState(updatedState);
    } catch (error) {
      console.error('Google login error: ', error.message);
      setAuthState({
        isLoggedIn: false,
        currentUser: null,
        errorMessage: error.message,
      });
    }
  };

  useEffect(() => {
    const fetchPurchasedMovies = async (user) => {
      if (!user) return;
      const docRef = doc(firestore, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.purchasedMovies) {
          const stringKeyObject = Object.entries(data.purchasedMovies).reduce(
            (acc, [key, val]) => {
              acc[String(key)] = val;
              return acc;
            },
            {}
          );
          setPurchasedMovies(Map(stringKeyObject));
          console.log("Fetched purchasedMovies:", stringKeyObject);
        } else {
          setPurchasedMovies(Map());
        }
      } else {
        setPurchasedMovies(Map());
      }
    };

    const fetchGenres = async (user) => {
      if (!user) return;
      const docRef = doc(firestore, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.selectedGenres) {
          const selectedGenreIds = data.selectedGenres;
          setGenreList((prevList) =>
            prevList.map((genre) => ({
              ...genre,
              selected: selectedGenreIds.includes(genre.id),
            }))
          );
          console.log("Fetched selected genres:", selectedGenreIds);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.exists() ? userDoc.data() : {};
        const updatedState = {
          isLoggedIn: true,
          currentUser: { ...user, ...userData },
          errorMessage: '',
        };
        setAuthState(updatedState);
        localStorage.setItem('authState', JSON.stringify(updatedState));

        await fetchPurchasedMovies(user);
        await fetchGenres(user);
      } else {
        setAuthState({
          isLoggedIn: false,
          currentUser: null,
          errorMessage: '',
        });
        localStorage.removeItem('authState');
        setCart(Map());
        setPurchasedMovies(Map());
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const selectedGenres = genreList
    .filter((genre) => genre.selected)
    .map((genre) => genre.id);

  const updateGenre = async (genre) => {
    setGenreList((prevList) => {
      const newList = prevList.map((item) =>
        item.id === genre.id ? { ...item, selected: !item.selected } : item
      );

      if (authState.currentUser) {
        const selectedGenreIds = newList
          .filter((g) => g.selected)
          .map((g) => g.id);

        const userDocRef = doc(firestore, "users", authState.currentUser.uid);
        updateDoc(userDocRef, { selectedGenres: selectedGenreIds })
          .then(() => console.log("Updated selectedGenres in Firestore"))
          .catch((err) => console.error("Failed to update selectedGenres:", err));
      }
      return newList;
    });
  };

  return (
    <ApplicationContext.Provider
      value={{
        authState,
        setAuthState,
        selectedGenres,
        genreList,
        updateGenre,
        logout,
        loginWithGoogle,
        cart,
        setCart,
        purchasedMovies,
        setPurchasedMovies,
        loading,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => useContext(ApplicationContext);