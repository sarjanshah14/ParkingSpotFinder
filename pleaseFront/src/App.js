import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import BookPage from "./pages/Book";
import BookingsPage from "./pages/Bookings";
import PremisesPage from "./pages/Premises";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import Pricing from "./pages/Pricing";
import Success from "./pages/Success";

// Wrapper component to decide when to show Navbar/Footer
function Layout({ darkMode, toggleTheme, onLogout }) {
  const location = useLocation();

  // Hide Navbar/Footer on landing and auth pages
  const hideLayout = location.pathname === "/";

  return (
    <>
      {!hideLayout && (
        <Navbar darkMode={darkMode} toggleTheme={toggleTheme} onLogout={onLogout} />
      )}

      {/* Outlet for nested routes */}
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/premises" element={<PremisesPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/success" element={<Success />} />
      </Routes>

      {!hideLayout && <Footer darkMode={darkMode} />}
    </>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  const toggleTheme = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev);
      return !prev;
    });
  };

  const onLogout = () => {
    console.log("Logout");
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
  }, [darkMode]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* All other routes use Layout */}
        <Route
          path="*"
          element={
            <Layout darkMode={darkMode} toggleTheme={toggleTheme} onLogout={onLogout} />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
