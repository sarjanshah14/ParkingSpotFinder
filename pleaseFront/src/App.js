import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from "react-router-dom";
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

// Layout wrapper component
function Layout({ darkMode, toggleTheme, onLogout }) {
  // We can choose to show/hide navbar based on additional logic if needed,
  // but simpler to just exclude Auth from this layout if desired, 
  // or keep it if AuthPage needs Navbar. 
  // For now, let's keep the user's existing logic style but in proper structure.

  // Actually, standard pattern: 
  // LandingPage serves itself. 
  // Main app pages use Layout.

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar darkMode={darkMode} toggleTheme={toggleTheme} onLogout={onLogout} />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer darkMode={darkMode} />
    </div>
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

        {/* Auth routes - typically usually standalone or share layout? 
            Original code had AuthPage *inside* Layout but hideLayout check 
            hid the navbar. 
            Let's put AuthPage outside Layout to be cleaner if it doesn't need Navbar.
        */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected/Main Routes using Layout */}
        <Route element={<Layout darkMode={darkMode} toggleTheme={toggleTheme} onLogout={onLogout} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/premises" element={<PremisesPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/success" element={<Success />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
