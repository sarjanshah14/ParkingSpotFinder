import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUsers, FaAward, FaGlobe, FaHeart, FaCar, FaMapMarkedAlt, FaMobileAlt, FaClock, FaLightbulb, FaHandshake, FaRocket } from 'react-icons/fa';

const About = () => {
  const stats = [
    { icon: FaUsers, number: '50K+', label: 'Happy Customers' },
    { icon: FaGlobe, number: '15+', label: 'Cities Covered' },
    { icon: FaAward, number: '99.9%', label: 'Customer Satisfaction' },
    { icon: FaHeart, number: '24/7', label: 'Customer Support' }
  ];

  const howItWorks = [
    { icon: FaMapMarkedAlt, title: 'Find a Spot', description: 'Search for available parking spots in real time using our app.' },
    { icon: FaMobileAlt, title: 'Book Instantly', description: 'Reserve your parking space with just a few taps.' },
    { icon: FaCar, title: 'Park & Relax', description: 'Drive to your reserved spot and enjoy a stress-free experience.' },
    { icon: FaClock, title: 'Extend Anytime', description: 'Need more time? Extend your booking directly from your phone.' }
  ];

  const milestones = [
    { year: '2020', event: 'Founded and launched in 2 major cities.' },
    { year: '2021', event: 'Reached 10,000+ users and expanded to 5 cities.' },
    { year: '2022', event: 'Introduced AI-powered spot prediction.' },
    { year: '2023', event: 'Partnered with 200+ private parking providers.' }
  ];

  const faqs = [
    { question: 'Is LetsPark available in my city?', answer: 'We are currently in 15+ cities and expanding rapidly. Check our app for the latest list.' },
    { question: 'How do I make a booking?', answer: 'Simply open the app, select your location, choose a spot, and confirm your reservation.' },
    { question: 'Can I cancel my booking?', answer: 'Yes, you can cancel anytime before your booking starts for a full refund.' }
  ];

  const values = [
    { icon: FaLightbulb, title: 'Innovation', description: 'Continuously improving our technology to serve you better.' },
    { icon: FaHandshake, title: 'Reliability', description: 'Dependable service you can trust for all your parking needs.' },
    { icon: FaRocket, title: 'Growth', description: 'Expanding our services to more cities and users every day.' }
  ];

  return (
    <>
      <div
        className="d-flex align-items-center justify-content-center text-center text-white bg-primary shadow-lg"
        style={{ minHeight: "25vh", width: "100%",backgroundImage: "linear-gradient(135deg,rgb(5, 50, 100) 0%,rgb(56, 130, 194) 100%)", // darker gradient
          position: "relative",
          overflow: "hidden" }}
      >
        <div className="px-4">
          <h1 className="display-3 fw-bold">About LetsPark</h1>
          <p className="lead fw-semibold">
            We're on a mission to revolutionize urban parking by making it simple,<br/>
            accessible, and stress-free for everyone.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <Container className="py-5">
        <Row className="mb-5">
          <Col lg={6} className="mb-4">
            <Card className="h-100 border-1 shadow">
              <Card.Body className="p-4">
                <div className="story-content">
                  <h3 className="fw-bold mb-3">Our Story</h3>
                  <p className="text-muted mb-4">
                    Founded in 2020, LetsPark was born out of frustration with the time-consuming
                    and stressful experience of finding parking in busy urban areas. Our founders,
                    experienced urban planners and tech enthusiasts, envisioned a world where
                    finding parking would be as easy as a few taps on your phone.
                  </p>
                  <p className="text-muted">
                    Today, we serve thousands of customers across major cities, providing them
                    with real-time parking availability, seamless booking, and secure payment
                    processing. Our technology-driven approach has transformed the parking
                    experience for urban dwellers and visitors alike.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6} className="mb-4">
            <Card className="h-100 border-1 shadow">
              <Card.Body className="p-4">
                <div className="mission-content">
                  <h3 className="fw-bold mb-3">Our Mission</h3>
                  <p className="text-muted mb-4">
                    To eliminate parking frustration by connecting drivers with available
                    parking spots through innovative technology and exceptional service.
                  </p>

                  <h3 className="fw-bold mb-3">Our Vision</h3>
                  <p className="text-muted">
                    A world where every driver can find parking effortlessly, contributing
                    to reduced traffic congestion, lower emissions, and more livable cities.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* How It Works Section */}
        <Row className="mb-5 justify-content-center text-center">
          {/* Section Header */}
          <Col xs={12} className="mb-4">
            <h3 className="fw-bold">How It Works</h3>
            <p className="text-muted">Simple steps to find your perfect parking spot</p>
          </Col>

          {/* Step Cards */}
          {howItWorks.map((step, idx) => (
            <Col key={idx} xs={10} sm={6} md={3} className="mb-4 d-flex justify-content-center">
              <div className="how-it-works-item p-4 h-100 border rounded shadow text-center">
                <step.icon size={40} className="mb-3 text-primary" />
                <h5 className="fw-bold">{step.title}</h5>
                <p className="text-muted small">{step.description}</p>
              </div>
            </Col>
          ))}
        </Row>


        {/* Stats Section */}
        <Row className="mb-5">
          <Col>
            <Card className="border-0 bg-primary text-white p-5 shadow">
              <h3 className="text-center mb-4 fw-bold">Our Impact</h3>
              <Row>
                {stats.map((stat, index) => (
                  <Col md={3} key={index} className="text-center mb-3">
                    <div className="stat-item">
                      <stat.icon size={40} className="mb-3" />
                      <h2 className="fw-bold">{stat.number}</h2>
                      <p className="mb-0">{stat.label}</p>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Timeline / Milestones */}
        <Row className="mb-5 justify-content-center text-center">
          {/* Section Header */}
          <Col xs={12} className="mb-4">
            <h3 className="fw-bold">Our Journey</h3>
          </Col>

          {/* Milestone Cards */}
          {milestones.map((m, idx) => (
            <Col key={idx} xs={10} sm={6} md={3} className="mb-4 d-flex justify-content-center">
              <div className="milestone-item p-4 h-100 border rounded shadow text-center">
                <h4 className="fw-bold text-primary">{m.year}</h4>
                <p className="text-muted small mb-0">{m.event}</p>
              </div>
            </Col>
          ))}
        </Row>


        {/* FAQ Section */}
        <Row className="mb-5 justify-content-center text-center">
          {/* Section Header */}
          <Col xs={12} className="mb-2">
            <h3 className="fw-bold">Frequently Asked Questions</h3>
          </Col>

          {/* FAQ Cards */}
          {faqs.map((f, idx) => (
            <Col key={idx} xs={10} sm={6} md={4} className="mb-4 d-flex justify-content-center">
              <Card className="h-100 border-1 shadow">
                <Card.Body>
                  <h6 className="fw-bold">{f.question}</h6>
                  <p className="text-muted small mb-0">{f.answer}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>


        {/* Custom Styles */}
        <style jsx>{`
        .how-it-works-item {
          transition: all 0.3s ease;
          background-color: white;
        }
        .how-it-works-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .milestone-item {
          transition: all 0.3s ease;
          background-color: white;
        }
        .milestone-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .stat-item {
          transition: all 0.3s ease;
        }
        .stat-item:hover {
          transform: scale(1.05);
        }
        .value-item {
          transition: all 0.3s ease;
        }
        .value-item:hover {
          transform: scale(1.05);
        }
      `}</style>
      </Container>
    </>
  );
};

export default About;