import React from 'react';
import { Link } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import Header from '../components/Header';

function CartView() {
  const { currentUser, getCart, removeFromCart } = useRegistration();
  const cart = getCart();

  const handleRemoveFromCart = (movieId) => {
    removeFromCart(movieId);
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
                    src=""
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
    </div>
  );
}

export default CartView;