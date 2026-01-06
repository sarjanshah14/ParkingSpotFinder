/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, Button, ListGroup,
  Spinner, Badge, InputGroup, Alert, Modal
} from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Validation constants
const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian phone numbers
const NAME_REGEX = /^[a-zA-Z ]{2,30}$/;

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom parking marker icon
const parkingIcon = new L.Icon({
  iconUrl: '/images/p.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [50, 70],
  iconAnchor: [25, 70],
  popupAnchor: [0, -70],
  shadowSize: [50, 70]
});

// Blue marker for current location
const currentLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function SetViewToCurrentLocation({ setUserLocation, setCurrentPosition }) {
  const map = useMap();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = [pos.coords.latitude, pos.coords.longitude];
          map.flyTo(userPos, 15);
          setUserLocation(userPos);
          setCurrentPosition(userPos);
        },
        (err) => {
          console.error('Geolocation error:', err);
          const defaultPos = [23.0225, 72.5714];
          map.flyTo(defaultPos, 15);
          setCurrentPosition(defaultPos);
        }
      );
    } else {
      const defaultPos = [23.0225, 72.5714];
      map.flyTo(defaultPos, 15);
      setCurrentPosition(defaultPos);
    }
  }, [map, setUserLocation, setCurrentPosition]);

  return null;
}

const MapController = React.memo(({ selectedPremise, selectedCity, cityCoordinates, markers }) => {
  const map = useMap();
  const prevPremiseRef = useRef();

  useEffect(() => {
    if (selectedPremise && selectedPremise !== prevPremiseRef.current) {
      const marker = markers[selectedPremise.id];
      if (marker && map) {
        map.flyTo([selectedPremise.latitude, selectedPremise.longitude], 15);
        setTimeout(() => {
          if (marker?.getPopup()) {
            marker.openPopup();
          }
        }, 300);
      }
      prevPremiseRef.current = selectedPremise;
    } else if (selectedCity && cityCoordinates[selectedCity]) {
      map.flyTo(cityCoordinates[selectedCity], 13);
    }
  }, [selectedPremise, selectedCity, map, cityCoordinates, markers]);

  return null;
});

const Book = () => {
  const [cities, setCities] = useState([]);
  const [premises, setPremises] = useState({});
  const { state } = useLocation();
  const [selectedCity, setSelectedCity] = useState(state?.selectedCity || null);
  const [selectedPremise, setSelectedPremise] = useState(state?.selectedPremise || null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    duration: '1',
    bookingDateTime: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    duration: '',
    bookingDateTime: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingSuccessDetails, setBookingSuccessDetails] = useState(null);
  const markersRef = useRef({});

  const cityCoordinates = {
    'Ahmedabad': [23.0225, 72.5714],
    'Vadodara': [22.3072, 73.1812]
  };

  const registerMarker = useCallback((id, marker) => {
    if (marker) {
      markersRef.current[id] = marker;
    }
  }, []);

  const extractCity = useCallback((location) => {
    if (!location) return 'Other';
    const loc = location.toLowerCase();
    if (loc.includes('ahmedabad')) return 'Ahmedabad';
    if (loc.includes('vadodara')) return 'Vadodara';
    return 'Other';
  }, []);

  const calculateTotalPrice = useCallback(() => {
    if (!selectedPremise?.price) return 0;
    const pricePerHour = parseFloat(selectedPremise.price.replace(/[^0-9.]/g, ''));
    const duration = parseInt(bookingForm.duration);
    return (pricePerHour * duration).toFixed(2);
  }, [selectedPremise, bookingForm.duration]);

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
    }
    return `${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5, 10)}`;
  };

  // Function to get minimum datetime for input (current time + 30 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Allow booking from 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  // Function to validate date and time
  const validateDateTime = (dateTime) => {
    if (!dateTime) return false;
    
    const selectedDate = new Date(dateTime);
    const now = new Date();
    
    // Check if selected date/time is at least 30 minutes from now
    return selectedDate.getTime() > now.getTime() + 30 * 60 * 1000;
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: '',
      phone: '',
      duration: '',
      bookingDateTime: ''
    };

    // Name validation
    if (!bookingForm.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    } else if (!NAME_REGEX.test(bookingForm.name)) {
      newErrors.name = 'Enter a valid name (2-30 characters)';
      valid = false;
    }

    // Phone validation
    if (!bookingForm.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else {
      const digitsOnly = bookingForm.phone.replace(/[^\d]/g, '');
      if (!PHONE_REGEX.test(digitsOnly)) {
        newErrors.phone = 'Enter a valid 10-digit Indian phone number';
        valid = false;
      }
    }

    // Duration validation
    if (!bookingForm.duration || bookingForm.duration < 1 || bookingForm.duration > 8) {
      newErrors.duration = 'Duration must be between 1-8 hours';
      valid = false;
    }

    // Date and time validation
    if (!bookingForm.bookingDateTime) {
      newErrors.bookingDateTime = 'Please select a date and time';
      valid = false;
    } else if (!validateDateTime(bookingForm.bookingDateTime)) {
      newErrors.bookingDateTime = 'Please select a time at least 30 minutes from now';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  useEffect(() => {
    const fetchPremises = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/premises/');
        const data = response.data.filter(p => {
          const city = extractCity(p.location);
          return city === 'Ahmedabad' || city === 'Vadodara';
        });

        const uniqueCities = [...new Set(data.map(p => extractCity(p.location)))];
        const grouped = {};

        uniqueCities.forEach(city => {
          grouped[city] = data.filter(p => extractCity(p.location) === city);
        });

        setCities(uniqueCities);
        setPremises(grouped);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching premises:', err);
        setLoading(false);
      }
    };

    fetchPremises();
  }, [extractCity]);

  const filteredPremises = (selectedCity ? premises[selectedCity] || [] : Object.values(premises).flat())
    .filter(premise =>
      premise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      premise.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (premise.features?.some(feature =>
        feature.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login to book');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/bookings/bookings/', {
        premise_id: selectedPremise.id,
        name: bookingForm.name,
        phone: bookingForm.phone.replace(/\D/g, ''), // Remove non-digits
        duration: bookingForm.duration,
        total_price: calculateTotalPrice(),
        booking_time: bookingForm.bookingDateTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Set success details for modal
      setBookingSuccessDetails({
        premise: selectedPremise.name,
        location: selectedPremise.location,
        duration: bookingForm.duration,
        total: calculateTotalPrice(),
        bookingId: response.data.id,
        phone: bookingForm.phone.replace(/\D/g, ''),
        bookingDateTime: bookingForm.bookingDateTime
      });

      setShowSuccessModal(true);
      setBookingForm({ name: '', phone: '', duration: '1', bookingDateTime: '' });
      setSelectedPremise(null);

    } catch (error) {
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
      } else {
        alert(error.response?.data?.error || 'Booking failed');
      }
    }
  };

  const renderPopupContent = useCallback((premise) => (
    <Popup maxWidth={300} minWidth={250} autoPan={true}>
      <div style={popupStyle}>
        <div style={titleStyle}>
          <span style={titleSpanStyle}>{premise.name}</span>
        </div>
        <div style={infoStyle}>📍 <strong>Location:</strong> {premise.location}</div>
        <div style={infoStyle}>💰 <strong>Price:</strong> {premise.price}</div>
        <div style={infoStyle}>
          🅿️ <strong>Available:</strong>{" "}
          <span style={{ color: premise.available > 0 ? "#2e7d32" : "#c62828" }}>
            {premise.available}/{premise.total} slots
          </span>
        </div>
        <div style={infoStyle}>⭐ <strong>Rating:</strong> {premise.rating || "Not rated"}</div>
        <div style={infoStyle}>🛠 <strong>Features:</strong> {premise.features?.join(', ') || "None"}</div>
        <Button
          variant="primary"
          size="sm"
          className="w-100"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPremise(premise);
          }}
          style={buttonStyle}
        >
          Book Parking Spot
        </Button>
      </div>
    </Popup>
  ), []);

  // Styles
  const popupStyle = {
    padding: "12px 14px",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "Segoe UI, sans-serif",
    textAlign: "left",
    width: "100%",
  };

  const titleStyle = { fontSize: "1rem", fontWeight: "bold", marginBottom: "8px" };
  const titleSpanStyle = {
    backgroundColor: "#e3f2fd",
    color: "#0d47a1",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "1rem",
  };
  const infoStyle = { fontSize: "0.85rem", marginBottom: "6px", color: "#444" };
  const buttonStyle = {
    backgroundColor: "#1976d2",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "0.85rem",
    fontWeight: "500",
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading parking locations...</p>
      </Container>
    );
  }

  return (
    <>
      <div
        className="d-flex align-items-center justify-content-center text-center text-white bg-primary shadow-lg mb-4"
        style={{ minHeight: "25vh", width: "100%",backgroundImage: "linear-gradient(135deg,rgb(5, 50, 100) 0%,rgb(56, 130, 194) 100%)", // darker gradient
          position: "relative",
          overflow: "hidden" }}
      >
        <div className="px-4">
          <h1 className="display-3 fw-bold">Book Your Spot</h1>
          <p className="lead fw-semibold">
            Find and reserve the perfect parking space near you in seconds.<br />
            Enjoy hassle-free parking with instant confirmations and real-time availability.
          </p>
        </div>
      </div>

      <Container className="py-4" style={{ height: 'calc(100vh - 56px)' }}>
        <Row style={{ height: '100%' }}>
          <Col lg={8} style={{ height: '100%' }}>
            <Card className="h-100">
              <Card.Header>
                <h5 className="mb-0">Parking Locations</h5>
              </Card.Header>
              <Card.Body className="p-0" style={{ height: 'calc(100% - 56px)' }}>
                <MapContainer
                  center={userLocation || [23.0225, 72.5714]}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  />
                  <SetViewToCurrentLocation
                    setUserLocation={setUserLocation}
                    setCurrentPosition={setCurrentPosition}
                  />

                  {currentPosition && (
                    <Marker
                      position={currentPosition}
                      icon={currentLocationIcon}
                    >
                      <Popup>Your Current Location</Popup>
                    </Marker>
                  )}

                  <MapController
                    selectedPremise={selectedPremise}
                    selectedCity={selectedCity}
                    cityCoordinates={cityCoordinates}
                    markers={markersRef.current}
                  />

                  {filteredPremises.map((premise) => (
                    <Marker
                      key={premise.id}
                      position={[premise.latitude, premise.longitude]}
                      eventHandlers={{ click: () => setSelectedPremise(premise) }}
                      icon={parkingIcon}
                      ref={(ref) => ref && registerMarker(premise.id, ref)}
                    >
                      {renderPopupContent(premise)}
                    </Marker>
                  ))}
                </MapContainer>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Card className="h-100">
              <Card.Header>
                <h5 className="mb-0">Find Parking</h5>
              </Card.Header>
              <Card.Body style={{ overflowY: 'auto', height: '100%' }}>
                <Form.Group className="mb-3">
                  <Form.Label>Select City</Form.Label>
                  <Form.Select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSelectedPremise(null);
                    }}
                  >
                    <option value="">All Cities</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Search Premises</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search by name, location or features"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button
                        variant="outline-secondary"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear
                      </Button>
                    )}
                  </InputGroup>
                </Form.Group>

                <div style={{ height: selectedPremise ? '40%' : '100%', overflowY: 'auto' }}>
                  <h6 className="mb-3">Available Premises ({filteredPremises.length})</h6>
                  {filteredPremises.length > 0 ? (
                    <ListGroup>
                      {filteredPremises.map((premise) => (
                        <ListGroup.Item
                          key={premise.id}
                          action
                          active={selectedPremise?.id === premise.id}
                          onClick={() => setSelectedPremise(premise)}
                          style={{
                            padding: '12px 16px',
                            backgroundColor: selectedPremise?.id === premise.id ? '#e7f1ff' : 'inherit'
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{premise.name}</h6>
                              <p className="small mb-1">{premise.location}</p>
                              <small style={{
                                color: premise.available > 0 ? "#2e7d32" : "#c62828",
                                fontWeight: '500'
                              }}>
                                {premise.available}/{premise.total} slots
                              </small>
                            </div>
                            <Badge bg={selectedPremise?.id === premise.id ? 'primary' : 'secondary'}>
                              {premise.price}
                            </Badge>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="text-center py-3">
                      <p>No parking premises found matching your search</p>
                    </div>
                  )}
                </div>

                {selectedPremise && (
                  <div style={{ marginTop: '20px' }}>
                    <Card>
                      <Card.Header>
                        <h5>Book Your Spot</h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="mb-0">{selectedPremise.name}</h6>
                          <Badge bg="primary">{selectedPremise.price}</Badge>
                        </div>
                        <Form onSubmit={handleBooking}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={bookingForm.name}
                              onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                              isInvalid={!!errors.name}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.name}
                            </Form.Control.Feedback>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              value={bookingForm.phone}
                              onChange={(e) => {
                                const formatted = formatPhoneNumber(e.target.value);
                                setBookingForm({ ...bookingForm, phone: formatted });
                              }}
                              isInvalid={!!errors.phone}
                              required
                              placeholder="Enter 10-digit Indian number"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.phone}
                            </Form.Control.Feedback>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Start Date & Time</Form.Label>
                            <Form.Control
                              type="datetime-local"
                              value={bookingForm.bookingDateTime}
                              onChange={(e) => setBookingForm({ 
                                ...bookingForm, 
                                bookingDateTime: e.target.value 
                              })}
                              isInvalid={!!errors.bookingDateTime}
                              min={getMinDateTime()}
                              required
                            />
                            <Form.Text className="text-muted">
                              Select when you want your parking to start (minimum 30 minutes from now)
                            </Form.Text>
                            <Form.Control.Feedback type="invalid">
                              {errors.bookingDateTime}
                            </Form.Control.Feedback>
                          </Form.Group>

                          <Form.Group className="mb-4">
                            <Form.Label>Duration (hours)</Form.Label>
                            <Form.Select
                              value={bookingForm.duration}
                              onChange={(e) => setBookingForm({ ...bookingForm, duration: e.target.value })}
                              isInvalid={!!errors.duration}
                              required
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((hour) => (
                                <option key={hour} value={hour}>
                                  {hour} hour{hour > 1 ? 's' : ''}
                                </option>
                              ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              {errors.duration}
                            </Form.Control.Feedback>
                            <div className="mt-2 text-end">
                              <strong>Total: ₹{calculateTotalPrice()}</strong>
                            </div>
                          </Form.Group>

                          <Button type="submit" variant="primary" className="w-100">
                            Book Now
                          </Button>
                        </Form>
                      </Card.Body>
                    </Card>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Booking Success Modal */}
        <Modal
          show={showSuccessModal}
          onHide={() => setShowSuccessModal(false)}
          centered
          backdrop="static"
        >
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title>Booking Confirmed!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#28a745" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
              </svg>
              <h4 className="mt-3">Your parking spot is booked!</h4>
            </div>

            <div className="booking-details">
              <p><strong>Location:</strong> {bookingSuccessDetails?.premise}</p>
              <p><strong>Start Time:</strong> {bookingSuccessDetails?.bookingDateTime ? new Date(bookingSuccessDetails.bookingDateTime).toLocaleString() : ''}</p>
              <p><strong>Duration:</strong> {bookingSuccessDetails?.duration} hours</p>
              <p><strong>Total Amount:</strong> ₹{bookingSuccessDetails?.total}</p>
              <p><strong>Booking ID:</strong> {bookingSuccessDetails?.bookingId}</p>
            </div>

            <Alert variant="info" className="mt-3">
              <i className="bi bi-info-circle-fill me-2"></i>
              A confirmation has been sent to {bookingSuccessDetails?.phone}.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={() => setShowSuccessModal(false)}>
              Done
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default Book;