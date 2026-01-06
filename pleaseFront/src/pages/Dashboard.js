import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import * as d3 from "d3";
import * as d3Cloud from "d3-cloud";

const Dashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const chartRef = useRef();
  const wordCloudRef = useRef();

  const getValidToken = async () => {
    let token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!token || !refreshToken) return null;

    try {
      await axios.get("/api/bookings/user-bookings/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return token;
    } catch (err) {
      if (err.response && err.response.status === 401) {
        try {
          const res = await axios.post("/api/users/token/refresh/", {
            refresh: refreshToken,
          });

          const newToken = res.data.access;
          localStorage.setItem("token", newToken);
          return newToken;
        } catch (refreshErr) {
          console.error("Refresh token failed", refreshErr);
          return null;
        }
      }
      return null;
    }
  };

  // Render star icons for review
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-warning" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-warning" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-warning" />);
      }
    }
    return stars;
  };

  // Rating Distribution Bar Chart with axes
  // Utility: Remove any existing svg inside a container
  // Utility: clear previous svg
const clearSvg = (ref) => {
  d3.select(ref.current).select("svg").remove();
};

// Simple Rating Chart
const createRatingChart = () => {
  if (!reviews.length) return;

  // Count ratings 1–5
  const ratingCounts = Array.from({ length: 5 }, (_, i) => ({
    rating: i + 1,
    count: reviews.filter(r => Math.floor(r.rating) === i + 1).length,
  }));

  clearSvg(chartRef);

  const width = chartRef.current.clientWidth || 300;
  const height = 200; // reduced height
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const svg = d3.select(chartRef.current)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(ratingCounts.map(d => d.rating))
    .range([0, chartWidth])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(ratingCounts, d => d.count) || 1])
    .nice()
    .range([chartHeight, 0]);

  // Axes
  chartGroup.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).tickFormat(d => `${d}★`));

  chartGroup.append("g")
    .call(d3.axisLeft(y).ticks(4));

  // Bars (simple, no rounded corners)
  chartGroup.selectAll("rect")
    .data(ratingCounts)
    .enter()
    .append("rect")
    .attr("x", d => x(d.rating))
    .attr("y", d => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", d => chartHeight - y(d.count))
    .attr("fill", "#4285f4");
};

// Simple Word Cloud
const createWordCloud = () => {
  if (!reviews.length) return;

  const allText = reviews.map(r => r.review).join(" ").toLowerCase();
  const stopWords = new Set([
    "this","that","with","have","from","they","were","your",
    "parking","about","would","could","should","there","their",
    "which","when","what","where","them","like","just","some",
    "more","very","good","great","nice","place","really","much","been","also",
  ]);

  const words = allText.split(/\W+/).filter(w => w.length > 3 && !stopWords.has(w));
  const freqMap = words.reduce((map, w) => {
    map[w] = (map[w] || 0) + 1;
    return map;
  }, {});

  const entries = Object.entries(freqMap)
    .map(([text, freq]) => ({ text, freq }))
    .sort((a, b) => b.freq - a.freq)
    .slice(0, 25);

  const sizeScale = d3.scaleLinear()
    .domain([d3.min(entries, d => d.freq), d3.max(entries, d => d.freq)])
    .range([20, 50]); // smaller font sizes

  const wordData = entries.map(d => ({ text: d.text, size: sizeScale(d.freq) }));

  clearSvg(wordCloudRef);

  const width = wordCloudRef.current.clientWidth || 300;
  const height = 220; // reduced height

  const svg = d3.select(wordCloudRef.current)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const layout = d3Cloud()
    .size([width, height])
    .words(wordData)
    .padding(4)
    .rotate(() => (Math.random() > 0.5 ? 0 : 90))
    .font("sans-serif")
    .fontSize(d => d.size)
    .on("end", (words) => {
      svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`)
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .text(d => d.text)
        .style("font-family", "sans-serif")
        .style("font-size", d => `${d.size}px`)
        .style("fill", (d, i) => d3.schemeCategory10[i % 10])
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`);
    });

  layout.start();
};




  useEffect(() => {
    const fetchBookings = async () => {
      const token = await getValidToken();
      if (!token) {
        console.error("No valid token, redirect to login");
        return;
      }

      try {
        const res = await axios.get("/api/bookings/user-bookings/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const lastFive = Array.isArray(res.data) ? res.data.slice(-6).reverse() : [];
        setBookings(lastFive);
      } catch (err) {
        console.error("Error fetching bookings", err);
      }
    };

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const response = await axios.get("/api/reviews/");
        setReviews(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching reviews", error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchBookings();
    fetchReviews();
  }, []);

  useEffect(() => {
    if (reviews.length) {
      createRatingChart();
      createWordCloud();
    }
  }, [reviews]);

  return (
    <div>
      {/* Hero Section */}
      {bookings.length > 0 && (
        <div
          className="d-flex align-items-center justify-content-center text-center text-white shadow-lg mb-4 hero-glass"
          style={{
            minHeight: "25vh",
            width: "100%",
            backgroundImage: "linear-gradient(135deg,rgb(5, 50, 100) 0%,rgb(56, 130, 194) 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="px-4">
            <h1 className="fw-bold display-3">
              Hi, {bookings.length > 0 ? bookings[0]?.name ?? "User" : "User"} 👋🏻
            </h1>
            <p className="lead fw-semibold">
              Skip the endless circles, dodge the parking chaos, and claim your perfect spot in style!
              <br />
              With Let's Park every ride starts smooth.
            </p>
          </div>
          <div className="glare"></div>
          <img
            src="images/car.png"
            alt="Car"
            className="car-animation delay"
            style={{ position: "absolute", bottom: "-35px", left: "-150px", height: "100px" }}
          />
          <img
            src="images/car1.png"
            alt="Car"
            className="car-animation"
            style={{ position: "absolute", bottom: "-35px", left: "-150px", height: "100px" }}
          />
          <img
            src="images/car2.png"
            alt="Car"
            className="car-animation delayed"
            style={{ position: "absolute", bottom: "-35px", left: "-150px", height: "100px" }}
          />
        </div>
      )}

      <Container className="my-5">
        {/* Why Choose Us */}
        <h2 className="text-center mb-4 fw-bold">Why Choose Let's Park?</h2>
        <Row>
          {[
            {
              title: "Real-Time Availability",
              text: "See which spots are free right now so you never waste time circling.",
            },
            {
              title: "Secure Parking",
              text: "Every premise is verified for safety, so your car is always in safe hands.",
            },
            {
              title: "Affordable Pricing",
              text: "Book by the hour or the day — only pay for what you use.",
            },
            {
              title: "Instant Booking",
              text: "Reserve with one click, no waiting or endless calls required.",
            },
          ].map((item, idx) => (
            <Col md={6} lg={3} key={idx} className="mb-2">
              <Card className="h-100 shadow border-1 rounded-4 hover-shadow">
                <Card.Body>
                  <Card.Title className="fw-bold">{item.title}</Card.Title>
                  <Card.Text>{item.text}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Review Analytics Section */}

        {/* Customer Reviews Section */}
        <h2 className="text-center mb-2 fw-bold mt-5">What Our Customers Say</h2>
        <div className="reviews-carousel">
          <div className="reviews-track">
            {reviews.map((review, idx) => (
              <Card key={idx} className="review-card shadow rounded-4 border-1">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-2">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{
                        width: 40,
                        height: 40,
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundImage: "linear-gradient(135deg, rgb(5, 50, 100) 0%, rgb(56, 130, 194) 100%)",
                      }}
                    >
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">{review.name}</h6>
                      <small className="text-muted">
                        {new Date(review.created_at).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    {renderStars(review.rating)}
                    <span className="ms-2 fw-semibold">{review.rating.toFixed(1)}</span>
                  </div>
                  <Card.Text className="review-text">
                    {review.review.length > 100 ? `${review.review.substring(0, 100)}...` : review.review}
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}

            {reviews.map((review, idx) => (
              <Card key={`dup-${idx}`} className="review-card rounded-4" style={{ minWidth: 280 }}>
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-2">
                    <div
                      className="rounded-circle d-flex align-items-center shadow border-1 justify-content-center me-2"
                      style={{
                        width: 40,
                        height: 40,
                        backgroundImage: "linear-gradient(135deg, rgb(5, 50, 100) 0%, rgb(56, 130, 194) 100%)",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">{review.name}</h6>
                      <small className="text-muted">{new Date(review.created_at).toLocaleDateString()}</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    {renderStars(review.rating)}
                    <span className="ms-2 fw-semibold">{review.rating.toFixed(1)}</span>
                  </div>
                  <Card.Text className="review-text">
                    {review.review.length > 100 ? `${review.review.substring(0, 100)}...` : review.review}
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
          <h2 className="text-center mb-4 fw-bold mt-5">Review Analytics</h2>
          <Row>
            <Col md={6} className="mb-2">
              <Card className="h-100 shadow border-1 rounded-4">
                <Card.Body>
                  <Card.Title className="fw-bold text-center">Rating Distribution</Card.Title>
                  <div ref={chartRef} className="text-center"></div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-2">
              <Card className="h-100 shadow border-1 rounded-4">
                <Card.Body>
                  <Card.Title className="fw-bold text-center">Review Word Cloud</Card.Title>
                  <div ref={wordCloudRef} className="text-center"></div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Smart Parking Tips */}
        <h2 className="text-center mb-4 fw-bold mt-5">Smart Parking Tips 💡</h2>
        <Row>
          {[
            "Book in advance during peak hours to avoid last-minute stress.",
            "Always check premise reviews for safety and convenience.",
            "Set reminders for your parking end-time to avoid extra charges.",
            "Prefer digital payments — it's faster and keeps bookings trackable.",
          ].map((tip, idx) => (
            <Col md={6} lg={3} key={idx} className="mb-4">
              <Card className="shadow border-1 rounded-4 hover-shadow h-100">
                <Card.Body>
                  <h6 className="fw-bold">Tip #{idx + 1}</h6>
                  <p>{tip}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Last 5 Bookings */}
        <h2 className="text-center mb-4 fw-bold mt-5">Your Recent Bookings</h2>
        <Row>
          {bookings.length > 0 ? (
            bookings.map((b, idx) => (
              <Col md={6} lg={4} key={idx} className="mb-4">
                <Card className="shadow border-1 rounded-4 h-100 hover-shadow">
                  <Card.Body>
                    <h5 className="fw-bold">{b.premise.name}</h5>
                    <p className="mb-1">
                      Duration: <span className="fw-semibold">{b.duration} hrs</span>
                    </p>
                    <p className="mb-1">
                      Date & Time: <span className="fw-semibold">{b.booking_time}</span>
                    </p>
                    <Badge
                      bg={
                        b.status === "confirmed"
                          ? "success"
                          : b.status === "cancelled"
                            ? "danger"
                            : "secondary"
                      }
                    >
                      {b.status}
                    </Badge>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p className="text-center">No bookings found.</p>
          )}
        </Row>
      </Container>

      <Button
        className="rounded-circle shadow-lg position-fixed d-flex align-items-center justify-content-center animate-pulse"
        style={{
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          fontSize: "42px",
          lineHeight: "1",
          transition: "all 0.3s ease-in-out",
          backgroundImage: "linear-gradient(135deg, rgb(5, 50, 100) 0%, rgb(56, 130, 194) 100%)",
          color: "white",
          border: "none",
          boxShadow: "0 0 15px rgba(0, 123, 255, 0.6)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.15)";
          e.currentTarget.style.boxShadow = "0 0 25px rgba(0, 123, 255, 0.9)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 0 15px rgba(0, 123, 255, 0.6)";
        }}
        onClick={() => navigate("/book")}
      >
        Ⓟ
      </Button>
    </div>
  );
};

export default Dashboard;
