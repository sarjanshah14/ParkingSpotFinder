import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { FaCheck, FaStar, FaCrown } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51Rtd171yRBtzWAxgUOmQdUViaHo1srTcLlXy54GbArsUVkXkF49bJWsiJFHKqWy7dADyhttYNACtL7c4ZUSxA5Z300ayMcDTeC');

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      monthlyPrice: 199,
      yearlyPrice: 1999,
      description: 'Perfect for occasional parkers',
      icon: null,
      popular: false,
      features: [
        'Book up to 5 parking slots per month',
        'Access to city-based search',
        'View booking history',
        'Email booking confirmation'
      ],
      buttonVariant: 'outline-primary',
      buttonText: 'Select Basic Plan'
    },
    {
      id: 'standard',
      name: 'Standard',
      monthlyPrice: 399,
      yearlyPrice: 3999,
      description: 'Great for regular commuters',
      icon: FaStar,
      popular: true,
      features: [
        'Book up to 20 parking slots per month',
        'Real-time availability updates',
        'SMS booking notifications',
        'Cancel and reschedule bookings',
        'Priority customer support'
      ],
      buttonVariant: 'primary',
      buttonText: 'Select Standard Plan'
    },
    {
      id: 'premium',
      name: 'Premium',
      monthlyPrice: 699,
      yearlyPrice: 6999,
      description: 'Ultimate parking experience',
      icon: FaCrown,
      popular: false,
      features: [
        'Unlimited bookings',
        'Real-time availability + predictive availability',
        'SMS and email notifications',
        'Advanced location-based search with filters',
        'Premium customer support (phone + chat)',
        'Early access to new features'
      ],
      buttonVariant: 'outline-primary',
      buttonText: 'Select Premium Plan'
    }
  ];

  const handlePlanSelect = async (plan) => {
    setLoading(true);
    setError(null);

    try {
      // Get customer email (you might get this from your auth system)
      const customerEmail = 's@gmail.com'; // Replace with actual user email

      // Create checkout session
      const response = await axios.post('http://localhost:8000/api/create-checkout-session/', {
        plan_id: plan.id,
        billing_period: isYearly ? 'year' : 'month',
        customer_email: customerEmail
      });

      const { sessionId } = response.data;
      const stripe = await stripePromise;

      // Redirect to Stripe checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate payment');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="d-flex align-items-center justify-content-center text-center text-white bg-primary shadow-lg mb-4"
        style={{ minHeight: "25vh", width: "100%",backgroundImage: "linear-gradient(135deg,rgb(5, 50, 100) 0%,rgb(56, 130, 194) 100%)", // darker gradient
          position: "relative",
          overflow: "hidden" }}
      >
        <div className="px-4">
          <h1 className="display-3 fw-bold">Choose Your Plan</h1>
          <p className="lead fw-semibold">
            Select the perfect parking plan that fits your needs.<br />
            Upgrade or downgrade anytime with no hidden fees.
          </p>
        </div>
      </div>

      {/* Billing Toggle */}
      <Container className="py-5">
        <Row className="mb-5">
          <Col className="text-center">
            <div className="d-inline-flex align-items-center bg-light rounded-pill p-1">
              <Button
                variant={!isYearly ? 'primary' : 'light'}
                size="sm"
                className="rounded-pill px-4"
                onClick={() => setIsYearly(false)}
              >
                Monthly
              </Button>
              <Button
                variant={isYearly ? 'primary' : 'light'}
                size="sm"
                className="rounded-pill px-4"
                onClick={() => setIsYearly(true)}
              >
                Yearly
                <Badge bg="success" className="ms-2">Save 17%</Badge>
              </Button>
            </div>
          </Col>
        </Row>

        {/* Error Message */}
        {error && (
          <Row className="mb-4">
            <Col className="text-center">
              <div className="alert alert-danger">{error}</div>
            </Col>
          </Row>
        )}

        {/* Pricing Cards */}
        <Row className="justify-content-center">
          {plans.map((plan) => (
            <Col lg={4} md={6} key={plan.id} className="mb-4">
              <Card
                className={`h-100 position-relative ${plan.popular ? 'border-primary shadow-lg' : 'shadow'
                  }`}
                style={{
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.3s ease'
                }}
              >
                {plan.popular && (
                  <div className="position-absolute top-0 start-50 translate-middle">
                    <Badge bg="primary" className="px-3 py-2">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card.Body className="p-4 text-center">
                  {plan.icon && (
                    <div className="mb-3">
                      <plan.icon
                        size={40}
                        className={plan.popular ? 'text-primary' : 'text-warning'}
                      />
                    </div>
                  )}

                  <h3 className="fw-bold mb-2">{plan.name}</h3>
                  <p className="text-muted mb-4">{plan.description}</p>

                  <div className="mb-4">
                    <span className="display-4 fw-bold text-primary">
                      ₹{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted fs-5">
                      {isYearly ? '/year' : '/month'}
                    </span>
                    {isYearly && (
                      <div className="mt-2">
                        <small className="text-success fw-bold">
                          Save ₹{(plan.monthlyPrice * 12 - plan.yearlyPrice).toFixed(2)} per year!
                        </small>
                      </div>
                    )}
                  </div>

                  <ul className="list-unstyled text-start mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="mb-3 d-flex align-items-start">
                        <FaCheck className="text-success me-3 mt-1" size={14} />
                        <span className="text-muted">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.buttonVariant}
                    size="lg"
                    className="w-100 py-3"
                    onClick={() => handlePlanSelect(plan)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="mt-5">
          <Col lg={10} className="mx-auto">
            <Card className="border-0">
              <Card.Body className="p-5 text-center">
                <h4 className="fw-bold mb-4">All Plans Include</h4>
                <Row className="g-4">
                  <Col md={3}>
                    <div className="border rounded-3 p-3 h-100 shadow-sm hover-shadow transition">
                      <div className="text-primary mb-2">
                        <FaCheck size={24} />
                      </div>
                      <h6 className="fw-bold">Secure Payments</h6>
                      <p className="text-muted small mb-0">
                        Industry-standard encryption for all transactions
                      </p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="border rounded-3 p-3 h-100 shadow-sm hover-shadow transition">
                      <div className="text-primary mb-2">
                        <FaCheck size={24} />
                      </div>
                      <h6 className="fw-bold">Mobile App Access</h6>
                      <p className="text-muted small mb-0">
                        Full-featured iOS and Android applications
                      </p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="border rounded-3 p-3 h-100 shadow-sm hover-shadow transition">
                      <div className="text-primary mb-2">
                        <FaCheck size={24} />
                      </div>
                      <h6 className="fw-bold">24/7 Support</h6>
                      <p className="text-muted small mb-0">
                        Round-the-clock customer assistance
                      </p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="border rounded-3 p-3 h-100 shadow-sm hover-shadow transition">
                      <div className="text-primary mb-2">
                        <FaCheck size={24} />
                      </div>
                      <h6 className="fw-bold">No Setup Fees</h6>
                      <p className="text-muted small mb-0">
                        Start using immediately with no hidden costs
                      </p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>


        {/* FAQ Section */}
        <Row className="mt-5">
          <Col lg={8} className="mx-auto">
            <h4 className="text-center fw-bold mb-4">Frequently Asked Questions</h4>
            <Row>
              <Col md={6} className="mb-4">
                <Card className="custom-card border-1 h-100">
                  <Card.Body className="p-4">
                    <h6 className="fw-bold text-primary mb-2">Can I change my plan anytime?</h6>
                    <p className="text-muted small mb-0">
                      Yes, you can upgrade or downgrade your plan at any time.
                      Changes take effect immediately, and billing is prorated.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-4">
                <Card className="custom-card border-1 h-100">
                  <Card.Body className="p-4">
                    <h6 className="fw-bold text-primary mb-2">What happens if I exceed my limit?</h6>
                    <p className="text-muted small mb-0">
                      You'll be notified when approaching your limit. Additional bookings
                      can be made at standard rates or by upgrading your plan.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-4">
                <Card className="custom-card border-1 h-100">
                  <Card.Body className="p-4">
                    <h6 className="fw-bold text-primary mb-2">Is there a free trial?</h6>
                    <p className="text-muted small mb-0">
                      New users get a 7-day free trial of the Standard plan
                      to experience all features before committing.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-4">
                <Card className="custom-card border-1 h-100">
                  <Card.Body className="p-4">
                    <h6 className="fw-bold text-primary mb-2">How do refunds work?</h6>
                    <p className="text-muted small mb-0">
                      We offer a 30-day money-back guarantee. Cancel anytime
                      within the first month for a full refund.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Pricing;