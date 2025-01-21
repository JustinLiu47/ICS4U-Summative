import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApplicationContext } from '../context/ApplicationContext';

const PrivateRoute = ({ children }) => {
  const { authState } = useApplicationContext();
  const { isLoggedIn } = authState;

  console.log("PrivateRoute: isLoggedIn =", isLoggedIn);

  if (!isLoggedIn) {
    console.log("PrivateRoute: User is not logged in, redirecting to /login");
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;