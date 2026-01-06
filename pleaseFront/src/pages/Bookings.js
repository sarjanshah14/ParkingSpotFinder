import React, { useState, useEffect } from 'react';
import { Nav, Card, Badge, Button, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { formatBookingDate } from '../utils/DateUtils';

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [bookings, setBookings] = useState({
    current: [],
    cancelled: [],
    history: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('/api/bookings/user-bookings/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const allBookings = response.data;

        setBookings({
          current: allBookings.filter(b => b.status === 'confirmed'),
          cancelled: allBookings.filter(b => b.status === 'cancelled'),
          history: allBookings.filter(b => b.status === 'completed')
        });
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/bookings/bookings/${bookingId}/cancel/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Refresh bookings after cancellation
      const updatedBookings = { ...bookings };
      const cancelledBooking = updatedBookings.current.find(b => b.id === bookingId);

      if (cancelledBooking) {
        cancelledBooking.status = 'cancelled';
        updatedBookings.cancelled = [...updatedBookings.cancelled, cancelledBooking];
        updatedBookings.current = updatedBookings.current.filter(b => b.id !== bookingId);
        setBookings(updatedBookings);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };
  const handleCompleteBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/bookings/bookings/${bookingId}/complete/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update local state
      const updatedBookings = { ...bookings };
      const completedBooking = updatedBookings.current.find(b => b.id === bookingId);

      if (completedBooking) {
        completedBooking.status = 'completed';
        updatedBookings.history = [...updatedBookings.history, completedBooking];
        updatedBookings.current = updatedBookings.current.filter(b => b.id !== bookingId);
        setBookings(updatedBookings);
      }
    } catch (error) {
      console.error('Error completing booking:', error);
      alert(error.response?.data?.error || 'Failed to complete booking');
    }
  };

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'danger';
      case 'completed': return 'secondary';
      default: return 'primary';
    }
  };

  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'Active';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const renderBookingCard = (booking) => {
    const formatted = formatBookingDate({
      ...booking,
      start_time: new Date(booking.start_time),
      end_time: new Date(booking.end_time),
    });

    const { date, timeRange, duration } = formatted;

    return (
      <Col md={6} lg={4} key={booking.id} className="mb-4">
        <Card className="custom-card h-100 shadow-sm border-0">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 text-dark">{booking.premise.name}</h5>
              <Badge bg={getStatusVariant(booking.status)} className="p-2">
                {getStatusText(booking.status)}
              </Badge>
            </div>
            <p className="text-muted small mb-3">{booking.premise.location}</p>

            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Date:</span>
                <span className="fw-bold">{date}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Time:</span>
                <span className="fw-bold">{timeRange}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Duration:</span>
                <span className="fw-bold">{duration}</span>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center border-top pt-3">
              <h6 className="mb-0 text-primary">Price</h6>
              <h5 className="mb-0 text-primary">₹{booking.total_price}</h5>
            </div>

            {booking.status === 'confirmed' && (
              <>
                <hr className="my-3" />
                <div className="d-grid gap-2">
                  <Button variant="outline-success" size="sm" onClick={() => handleCompleteBooking(booking.id)}>
                    End Booking Early
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleCancelBooking(booking.id)}>
                    Cancel Booking
                  </Button>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </Col>
    );
  };

  if (loading) {
    return (
      <div className="container py-4 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="d-flex align-items-center justify-content-center text-center text-white bg-primary shadow-lg mb-4"
        style={{
          minHeight: "25vh", width: "100%", backgroundImage: "linear-gradient(135deg,rgb(5, 50, 100) 0%,rgb(56, 130, 194) 100%)", // darker gradient
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div className="px-4">
          <h1 className="display-3 fw-bold">My Bookings</h1>
          <p className='lead fw-semibold'>Here’s a complete list of your active and past bookings<br />
            Manage, review, or exit anytime with just a click</p>
        </div>
      </div>

      <div className="container py-5">

        <Nav variant="tabs" className="mb-4 justify-content-center">
          <Nav.Item>
            <Nav.Link
              active={activeTab === 'current'}
              onClick={() => setActiveTab('current')}
            >
              Current ({bookings.current.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === 'cancelled'}
              onClick={() => setActiveTab('cancelled')}
            >
              Cancelled ({bookings.cancelled.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
            >
              History ({bookings.history.length})
            </Nav.Link>
          </Nav.Item>
        </Nav>


        <Row>
          {bookings[activeTab].length > 0 ? (
            bookings[activeTab].map(renderBookingCard)
          ) : (
            <Col>
              <Card className="text-center py-5 shadow-sm">
                <Card.Body>
                  <h5>No {activeTab} bookings found</h5>
                  <p className="text-muted">
                    {activeTab === 'current' && 'You have no active bookings at the moment.'}
                    {activeTab === 'cancelled' && 'You have no cancelled bookings.'}
                    {activeTab === 'history' && 'You have no booking history yet.'}
                  </p>
                  <Button variant="primary" href="/book">
                    Book Your First Spot
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </div>
    </>
  );
};

export default Bookings;