import React, { useState } from 'react';
import {
    Container, Row, Col, Card, Form, Button,
    Alert, Spinner
} from 'react-bootstrap';
import {
    FaPhone, FaEnvelope, FaMapMarkerAlt,
    FaFacebook, FaTwitter, FaInstagram, FaLinkedin,
    FaCheck, FaTimes, FaStar
} from 'react-icons/fa';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [reviewData, setReviewData] = useState({
        name: '',
        rating: 0,
        review: ''
    });
    const [loading, setLoading] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [reviewSubmitStatus, setReviewSubmitStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [reviewErrorMessage, setReviewErrorMessage] = useState('');

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleReviewInputChange = (e) => {
        setReviewData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRatingChange = (rating) => {
        setReviewData(prev => ({ ...prev, rating }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitStatus(null);
        setErrorMessage('');

        try {
            const response = await fetch('http://localhost:8000/api/mess/contact/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setSubmitStatus('error');
                setErrorMessage('Failed to send message. Please try again.');
            }
        } catch (error) {
            setSubmitStatus('error');
            setErrorMessage('An error occurred while sending your message.');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewLoading(true);
        setReviewSubmitStatus(null);
        setReviewErrorMessage('');

        // Validate form
        if (reviewData.rating === 0) {
            setReviewSubmitStatus('error');
            setReviewErrorMessage('Please select a rating');
            setReviewLoading(false);
            return;
        }

        if (!reviewData.name.trim() || !reviewData.review.trim()) {
            setReviewSubmitStatus('error');
            setReviewErrorMessage('Please fill in all fields');
            setReviewLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/reviews/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reviewData)
            });

            const data = await response.json();

            if (response.ok) {
                setReviewSubmitStatus('success');
                setReviewData({ name: '', rating: 0, review: '' });
            } else {
                setReviewSubmitStatus('error');
                setReviewErrorMessage('Failed to submit review. Please try again.');
            }
        } catch (error) {
            setReviewSubmitStatus('error');
            setReviewErrorMessage('An error occurred while submitting your review.');
        } finally {
            setReviewLoading(false);
        }
    };

    // StarRating Component
    const StarRating = ({ rating, onRatingChange, disabled }) => {
        return (
            <div>
                {[...Array(5)].map((star, index) => {
                    const ratingValue = index + 1;
                    
                    return (
                        <label key={index}>
                            <input
                                type="radio"
                                name="rating"
                                value={ratingValue}
                                onClick={() => onRatingChange(ratingValue)}
                                style={{ display: 'none' }}
                                disabled={disabled}
                            />
                            <FaStar
                                className="star"
                                color={ratingValue <= rating ? "#ffc107" : "#e4e5e9"}
                                size={30}
                                style={{ cursor: disabled ? 'default' : 'pointer', marginRight: '5px' }}
                            />
                        </label>
                    );
                })}
            </div>
        );
    };

    const contactInfo = [
        {
            icon: FaPhone,
            title: 'Phone',
            detail: '+91 63516 48593',
            href: 'tel:+916351648593'
        },
        {
            icon: FaEnvelope,
            title: 'Email',
            detail: 'support@letspark.in',
            href: 'mailto:support@letspark.in'
        },
        {
            icon: FaMapMarkerAlt,
            title: 'Address',
            detail: 'Ahmedabad, Gujarat, India',
            href: '#'
        }
    ];

    const socialLinks = [
        { icon: FaFacebook, url: 'https://facebook.com', color: '#1877f2' },
        { icon: FaTwitter, url: 'https://twitter.com', color: '#1da1f2' },
        { icon: FaInstagram, url: 'https://instagram.com', color: '#e4405f' },
        { icon: FaLinkedin, url: 'https://linkedin.com', color: '#0077b5' }
    ];

    const cardStyle = {
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgb(0 0 0 / 0.1)'
    };

    return (
        <>
            {/* Full-Width Hero */}
            <div
                className="d-flex align-items-center justify-content-center text-center text-white bg-primary shadow-lg"
                style={{ 
                    minHeight: "25vh", 
                    width: "100%",
                    backgroundImage: "linear-gradient(135deg,rgb(5, 50, 100) 0%,rgb(56, 130, 194) 100%)",
                    position: "relative",
                    overflow: "hidden" 
                }}
            >
                <div className="px-4">
                    <h1 className="display-3 fw-bold">Get In Touch</h1>
                    <p className="lead fw-semibold">
                        Questions, feedback, or need assistance? We’re here for you.<br />
                        Reach out anytime using the form or contact info below.
                    </p>
                </div>
            </div>

            {/* Main Contact Section */}
            <Container className="py-5">
                {/* Submission Status */}
                {submitStatus && (
                    <Row className="mb-4">
                        <Col lg={7} className="mx-auto">
                            <Alert
                                variant={submitStatus === "success" ? "success" : "danger"}
                                onClose={() => setSubmitStatus(null)}
                                dismissible
                                className="mt-3"
                            >
                                <div className="d-flex align-items-center">
                                    {submitStatus === "success" ? (
                                        <FaCheck className="me-2" />
                                    ) : (
                                        <FaTimes className="me-2" />
                                    )}
                                    {submitStatus === "success"
                                        ? "Thank you! Your message has been sent successfully."
                                        : errorMessage || "Failed to send your message."}
                                </div>
                            </Alert>
                        </Col>
                    </Row>
                )}

                {reviewSubmitStatus && (
                    <Row className="mb-4">
                        <Col lg={7} className="mx-auto">
                            <Alert
                                variant={reviewSubmitStatus === "success" ? "success" : "danger"}
                                onClose={() => setReviewSubmitStatus(null)}
                                dismissible
                                className="mt-3"
                            >
                                <div className="d-flex align-items-center">
                                    {reviewSubmitStatus === "success" ? (
                                        <FaCheck className="me-2" />
                                    ) : (
                                        <FaTimes className="me-2" />
                                    )}
                                    {reviewSubmitStatus === "success"
                                        ? "Thank you! Your review has been submitted successfully."
                                        : reviewErrorMessage || "Failed to submit your review."}
                                </div>
                            </Alert>
                        </Col>
                    </Row>
                )}

                <Row>
                    {/* Contact Form */}
                    <Col lg={4} className="mb-5">
                        <Card style={cardStyle} className="border-1 shadow">
                            <Card.Body className="p-5">
                                <h3 className="fw-bold mb-4">Send Us a Message</h3>
                                <Form onSubmit={handleSubmit} noValidate>
                                    <Row>
                                        <Col md={12}>
                                            <Form.Group className="mb-3" controlId="formName">
                                                <Form.Label>Full Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Your full name"
                                                    required
                                                    disabled={loading}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group className="mb-3" controlId="formEmail">
                                                <Form.Label>Email Address</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="Your email address"
                                                    required
                                                    disabled={loading}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-4" controlId="formMessage">
                                        <Form.Label>Message</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={8}
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            placeholder="Write your message here..."
                                            required
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        className="w-100"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Message"
                                        )}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Contact Info */}
                    <Col lg={4}>
                        <Card style={cardStyle} className="border-1 shadow mb-4">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4">Contact Information</h5>
                                {contactInfo.map(({ icon: Icon, title, detail, href }, i) => (
                                    <div key={i} className="d-flex align-items-center mb-4">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                            style={{
                                                width: 48,
                                                height: 48,
                                                backgroundColor: "#09b8f7",
                                                color: "white",
                                            }}
                                        >
                                            <Icon size={22} />
                                        </div>
                                        <div>
                                            <h6 className="mb-1 fw-semibold">{title}</h6>
                                            {href !== "#" ? (
                                                <a
                                                    href={href}
                                                    className="text-decoration-none text-muted"
                                                >
                                                    {detail}
                                                </a>
                                            ) : (
                                                <span className="text-muted">{detail}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>

                        <Card style={cardStyle} className="border-1 shadow mb-4">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4">Business Hours</h5>
                                <p className="mb-2">
                                    <strong>Mon - Fri:</strong>{" "}
                                    <span className="text-muted">9:00 AM - 6:00 PM</span>
                                </p>
                                <p className="mb-2">
                                    <strong>Saturday:</strong>{" "}
                                    <span className="text-muted">10:00 AM - 4:00 PM</span>
                                </p>
                                <p className="mb-2">
                                    <strong>Sunday:</strong>{" "}
                                    <span className="text-muted">Closed</span>
                                </p>
                                <hr />
                                <p className="text-primary fw-semibold mb-1">
                                    24/7 Customer Support
                                </p>
                                <p className="text-muted small">
                                    Available via app chat and phone
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    {/* Review Form */}
                    <Col lg={4} className="mb-5">
                        <Card style={cardStyle} className="border-1 shadow">
                            <Card.Body className="p-5">
                                <h3 className="fw-bold mb-4">Write a Review</h3>
                                <Form onSubmit={handleReviewSubmit} noValidate>
                                    <Row>
                                        <Col md={12}>
                                            <Form.Group className="mb-3" controlId="formReviewName">
                                                <Form.Label>Full Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={reviewData.name}
                                                    onChange={handleReviewInputChange}
                                                    placeholder="Your full name"
                                                    required
                                                    disabled={reviewLoading}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3" controlId="formRating">
                                        <Form.Label>Rating</Form.Label>
                                        <div>
                                            <StarRating 
                                                rating={reviewData.rating} 
                                                onRatingChange={handleRatingChange}
                                                disabled={reviewLoading}
                                            />
                                        </div>
                                        {reviewSubmitStatus === 'error' && reviewData.rating === 0 && (
                                            <div className="text-danger small mt-1">
                                                Please select a rating
                                            </div>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="formReview">
                                        <Form.Label>Review</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={8}
                                            name="review"
                                            value={reviewData.review}
                                            onChange={handleReviewInputChange}
                                            placeholder="Write your review here..."
                                            required
                                            disabled={reviewLoading}
                                        />
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        className="w-100"
                                        disabled={reviewLoading}
                                    >
                                        {reviewLoading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Review"
                                        )}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Contact;