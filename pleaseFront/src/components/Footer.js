import { Link } from "react-router-dom";

const Footer = ({ darkMode }) => {
  return (
    <footer className={`py-5 ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}>
      <div className="container">
        <hr className="my-4" />
        <div className="row">
          {/* Brand & About */}
          <div className="col-lg-4 mb-4">
            <h5 className="fw-bold" style={{ color: "#2563EB" }}>
              🚗 LetsPark
            </h5>
            <p className="mb-3">
              Smart parking solutions for modern cities. Find, book, and pay for parking in seconds.
            </p>
            <div className="d-flex">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="me-2">
                📘
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="me-2">
                🐦
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="me-2">
                📷
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                💼
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li><Link to="/dashboard" className="text-decoration-none">Home</Link></li>
              <li><Link to="/bookings" className="text-decoration-none">My Bookings</Link></li>
              <li><Link to="/premises" className="text-decoration-none">Our Premises</Link></li>
              <li><Link to="/pricing" className="text-decoration-none">Pricing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Support</h6>
            <ul className="list-unstyled">
              <li><Link to="/about" className="text-decoration-none">About Us</Link></li>
              <li><Link to="/contact" className="text-decoration-none">Contact</Link></li>
              <li><Link to="/help" className="text-decoration-none">Help Center</Link></li>
              <li><Link to="/privacy" className="text-decoration-none">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-4 mb-4">
            <h6 className="fw-bold mb-3">Contact Information</h6>
            <p className="mb-2">📧 support@letspark.com</p>
            <p className="mb-2">📞 Toll-Free: 1800-555-1234</p>
            <p className="mb-2">📍 123 Parking Street, Bengaluru, India</p>
            <p className="mb-0">🕒 Mon–Sun: 24 Hours</p>
          </div>
        </div>

        <hr className="my-4" />

        {/* Bottom Bar */}
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0">&copy; 2024 LetsPark. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0">Made with ❤️ for smarter parking</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
