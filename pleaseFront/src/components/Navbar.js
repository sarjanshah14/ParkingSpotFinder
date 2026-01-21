/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const CustomNavbar = ({ darkMode, toggleTheme, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("access_token")
  );

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Hide navbar only on landing page
  if (location.pathname === "/") {
    return null;
  }

  // ✅ update scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ check auth whenever location changes (so after login it updates immediately)
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("access_token"));
  }, [location]);

  // ✅ also listen for login/logout changes across tabs
  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(!!localStorage.getItem("access_token"));
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token"); // Cleanup old key if any
    setIsAuthenticated(false);
    if (onLogout) onLogout();
    navigate("/");
  };

  const handleNavClick = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate("/auth"); // force login first
    }
  };

  return (
    <nav
      className={`navbar navbar-expand-lg sticky-top ${scrolled ? "navbar-scrolled shadow-sm" : ""
        } ${darkMode ? "navbar-dark bg-dark" : "navbar-light bg-light"}`}
    >
      <div className="container">
        <button
          className="navbar-brand fw-bold fs-3 btn btn-link p-0 border-0"
          onClick={() => handleNavClick("/dashboard")}
          style={{
            background:
              "linear-gradient(135deg, rgb(28, 119, 224) 0%, rgb(56, 130, 194) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          LetsPark
        </button>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => handleNavClick("/dashboard")}
              >
                Home
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => handleNavClick("/book")}
              >
                Book
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => handleNavClick("/bookings")}
              >
                Bookings
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => handleNavClick("/premises")}
              >
                Our Premises
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => handleNavClick("/pricing")}
              >
                Pricing
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => handleNavClick("/about")}
              >
                About Us
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => handleNavClick("/contact")}
              >
                Contact Us
              </button>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-secondary me-2"
              onClick={toggleTheme}
              title="Toggle Theme"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            {isAuthenticated ? (
              <button className="btn btn-outline-danger" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate("/auth")}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CustomNavbar;
