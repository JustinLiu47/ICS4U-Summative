import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ApplicationProvider } from './context/ApplicationContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Cart from './pages/Cart';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ApplicationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <Cart />
              </PrivateRoute>
            }
          />
          
        </Routes>
      </Router>
    </ApplicationProvider>
  );
}

export default App;