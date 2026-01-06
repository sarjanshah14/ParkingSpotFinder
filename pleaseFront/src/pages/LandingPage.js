import { Link } from "react-router-dom"
import "../styles/LandingPage.css"

const LandingPage = () => {
  return (
    <div className="landing-page">
      <video autoPlay loop muted playsInline className="bg-video">
        <source src="/videos/parking-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="overlay"></div>

      <div className="content text-center px-3">
        <h1 className="title">LetsPark</h1>
        <p className="lead fw-semibold mb-1" style={{ fontSize: '23px', marginTop: '-20px' }}>
            Hassle-free parking at your fingertips! <br />Real-time spots, easy bookings, smooth exits.
          </p>
        <Link to="/auth" className="btn btn-outline-light btn-lg mt-3">
          Get Started
        </Link>
      </div>
    </div>
  )
}

export default LandingPage
