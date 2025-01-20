import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApplicationContext } from '../context/ApplicationContext';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useApplicationContext();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;