import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeView from "./views/HomeView";
import RegisterView from "./views/RegisterView";
import LoginView from "./views/LoginView";
import MoviesView from "./views/MoviesView";
import DetailView from "./views/DetailView";
import GenreView from "./views/GenreView";
import CartView from "./views/CartView";
import SettingsView from "./views/SettingsView";
import { ApplicationProvider } from './context/ApplicationContext';
import './App.css';

function App() {
  return (
    <ApplicationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/cart" element={<CartView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/movies" element={<MoviesView />}>
            <Route path=":id" element={<DetailView />} />
            <Route path="genre/:id" element={<GenreView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ApplicationProvider>
  );
}

export default App;