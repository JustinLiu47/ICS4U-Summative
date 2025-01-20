import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApplicationContext } from '../context/ApplicationContext';
import Header from '../components/Header';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

function CartView() {
  const { currentUser, getCart, removeFromCart, isMoviePurchased } = useApplicationContext();
  const cart = getCart();
  const navigate = useNavigate();

  const loadMovie = (id) => {
    navigate(`/movies/${id}`);
  };

  const handleRemoveFromCart = (movieId) => {
    removeFromCart(movieId);
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      alert('You need to be logged in to complete the purchase.');
      return;
    }

    try {
      localStorage.removeItem('cart');
      localStorage.removeItem('purchasedMovies');

      const userRef = doc(db, 'users', currentUser.id);
      const purchasedMovies = cart.map((movie) => movie.id);

      await updateDoc(userRef, {
        purchasedMovies: arrayUnion(...purchasedMovies),
      });

      cart.forEach((movie) => removeFromCart(movie.id));

      alert('Thank you for your purchase!');

      navigate('/');
    } catch (error) {
      console.error("Error during checkout:", error);
      alert('An error occurred during checkout. Please try again.');
    }
  };

  return (
    <div className="cart-container">
      <Header />
      <h1>Your Cart</h1>
      {currentUser ? (
        cart.length > 0 ? (
          <div className="cart-grid">
            {cart.map((movie) => (
              <div key={movie.id} className="cart-item">
                <div className="movie-info">
                  <h2 className="movie-title">{movie.title}</h2>
                </div>
                {movie.poster_path ? (
                  <img
                    className="posterPicture"
                    src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                    alt={movie.title}
                    onClick={() => loadMovie(movie.id)}
                  />
                ) : (
                  <img
                    className="posterPicture"
                    src="https://via.placeholder.com/200x300?text=No+Poster"
                    alt="No poster available"
                  />
                )}
                <button
                  className="remove-button"
                  onClick={() => handleRemoveFromCart(movie.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>Your cart is empty. <Link to="/">Return Home</Link>.</p>
        )
      ) : (
        <p>Please <Link to="/login">log in</Link> to access your cart.</p>
      )}

      {cart.length > 0 && (
        <button className="checkout-button" onClick={handleCheckout}>
          Checkout
        </button>
      )}
    </div>
  );
}

export default CartView;