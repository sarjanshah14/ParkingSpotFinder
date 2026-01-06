import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Badge,
  Form, InputGroup, Dropdown, Spinner, Alert
} from 'react-bootstrap';
import {
  FaMapMarkerAlt, FaCar, FaStar, FaStarHalfAlt,
  FaRegStar, FaSearch, FaFilter
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Premises = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [premises, setPremises] = useState([]);
  const [filteredPremises, setFilteredPremises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract city from location string
  const extractCity = useCallback((location) => {
    if (!location) return 'Other';
    const loc = location.toLowerCase();
    if (loc.includes('ahmedabad')) return 'Ahmedabad';
    if (loc.includes('vadodara')) return 'Vadodara';
    return 'Other';
  }, []);

  // Fetch premises from backend
  useEffect(() => {
    const fetchPremises = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/premises/');
        const premisesWithCity = response.data.map(premise => ({
          ...premise,
          city: extractCity(premise.location)
        }));
        setPremises(premisesWithCity);
        setFilteredPremises(premisesWithCity);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPremises();
  }, [extractCity]);

  // Filter premises
  useEffect(() => {
    let results = premises;

    if (selectedCity !== 'All Cities') {
      results = results.filter(premise => premise.city === selectedCity);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(premise =>
        premise.name.toLowerCase().includes(term) ||
        premise.location.toLowerCase().includes(term)
      );
    }

    setFilteredPremises(results);
  }, [searchTerm, selectedCity, premises]);

  // Get unique cities
  const cities = ['All Cities', ...new Set(premises.map(p => p.city))];

  const getAvailabilityColor = (available, total) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'success';
    if (percentage > 20) return 'warning';
    return 'danger';
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={`full-${i}`} />);
    if (halfStar) stars.push(<FaStarHalfAlt key="half" />);
    for (let i = 0; i < emptyStars; i++) stars.push(<FaRegStar key={`empty-${i}`} />);
    return stars;
  };

  const handleBookNow = (premise) => {
    navigate('/book', {
      state: {
        selectedPremise: premise,
        selectedCity: extractCity(premise.location)
      }
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading parking premises...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error loading premises</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <div
        className="d-flex align-items-center justify-content-center text-center text-white bg-primary shadow-lg mb-4"
        style={{ minHeight: "25vh", width: "100%", backgroundImage: "linear-gradient(135deg,rgb(5, 50, 100) 0%,rgb(56, 130, 194) 100%)", // darker gradient
          position: "relative",
          overflow: "hidden"}}
      >
        <div className="px-4">
          <h1 className="display-3 fw-bold">Our Parking Premises</h1>
          <p className="lead fw-semibold">
          Explore all our premium parking locations across the city.<br/>
          Find the perfect spot that’s safe, convenient, and ready when you are.
          </p>
        </div>
      </div>


      <Container className="py-4">
        {/* Search and Filter Controls */}
        <Row className="mb-3 g-2">
          <Col md={8}>
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={4}>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" className="w-100">
                <FaFilter className="me-2" />
                {selectedCity}
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100">
                {cities.map((city, index) => (
                  <Dropdown.Item
                    key={index}
                    active={city === selectedCity}
                    onClick={() => setSelectedCity(city)}
                  >
                    {city}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>

        {filteredPremises.length === 0 ? (
          <Alert variant="info" className="text-center">
            No parking premises found matching your criteria
          </Alert>
        ) : (
          <Row>
            {filteredPremises.map(premise => (
              <Col md={6} lg={4} key={premise.id} className="mb-3">
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">{premise.name}</h5>
                      <Badge bg="primary" className="fs-6">{premise.price}</Badge>
                    </div>

                    <div className="d-flex align-items-center text-muted mb-2">
                      <FaMapMarkerAlt className="me-1" />
                      <small>{premise.location}</small>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center text-muted">
                        <FaCar className="me-1" />
                        <small>{premise.available}/{premise.total} available</small>
                      </div>
                      <Badge bg={getAvailabilityColor(premise.available, premise.total)}>
                        {premise.available > 0 ? 'Available' : 'Full'}
                      </Badge>
                    </div>

                    {premise.features?.length > 0 && (
                      <div className="mb-2">
                        <div className="d-flex flex-wrap gap-1">
                          {premise.features.map((feature, idx) => (
                            <Badge
                              key={idx}
                              bg="light"
                              text="dark"
                              className="small rounded-pill px-2 py-1"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {premise.rating && (
                      <div className="d-flex align-items-center text-warning mb-2">
                        {renderStars(premise.rating)}
                        <span className="text-muted ms-2">{premise.rating.toFixed(1)}</span>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-auto w-100"
                      onClick={() => handleBookNow(premise)}
                      disabled={premise.available === 0}
                    >
                      Book Now
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default Premises;