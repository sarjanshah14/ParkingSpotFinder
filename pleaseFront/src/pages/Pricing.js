/* eslint-disable no-unused-labels */
import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FaCheck, FaStar, FaCrown } from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";
import { createCheckoutSession, getStripeConfig } from "../api";

/* ------------------------------------------------------------------
   Stripe init (dynamic)
------------------------------------------------------------------- */
let stripePromise = null;

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);

  React.useEffect(() => {
    const initStripe = async () => {
      try {
        const envKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
        if (envKey && envKey !== "pk_test_YOUR_STRIPE_PUBLIC_KEY_HERE") {
          stripePromise = loadStripe(envKey);
          setIsStripeLoaded(true);
        } else {
          // Fetch from backend
          const { publicKey } = await getStripeConfig();
          if (publicKey) {
            stripePromise = loadStripe(publicKey);
            setIsStripeLoaded(true);
          } else {
            console.error("❌ Stripe public key not found in backend or env");
          }
        }
      } catch (err) {
        console.error("❌ Failed to load Stripe config:", err);
      }
    };
    initStripe();
  }, []);

  const plans = [
    {
      id: "basic",
      name: "Basic",
      monthlyPrice: 199,
      yearlyPrice: 1999,
      description: "Perfect for occasional parkers",
      icon: null,
      popular: false,
      features: [
        "Book up to 5 parking slots per month",
        "Access to city-based search",
        "View booking history",
        "Email booking confirmation",
      ],
      buttonVariant: "outline-primary",
      buttonText: "Select Basic Plan",
    },
    {
      id: "standard",
      name: "Standard",
      monthlyPrice: 399,
      yearlyPrice: 3999,
      description: "Great for regular commuters",
      icon: FaStar,
      popular: true,
      features: [
        "Book up to 20 parking slots per month",
        "Real-time availability updates",
        "SMS booking notifications",
        "Cancel and reschedule bookings",
        "Priority customer support",
      ],
      buttonVariant: "primary",
      buttonText: "Select Standard Plan",
    },
    {
      id: "premium",
      name: "Premium",
      monthlyPrice: 699,
      yearlyPrice: 6999,
      description: "Ultimate parking experience",
      icon: FaCrown,
      popular: false,
      features: [
        "Unlimited bookings",
        "Real-time availability + predictive availability",
        "SMS and email notifications",
        "Advanced location-based search with filters",
        "Premium customer support (phone + chat)",
        "Early access to new features",
      ],
      buttonVariant: "outline-primary",
      buttonText: "Select Premium Plan",
    },
  ];

  const handlePlanSelect = async (plan) => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      if (!stripePromise) {
        throw new Error("Stripe is not configured");
      }

      const stripe = await stripePromise;

      // ✅ Hardcoded email (as requested)
      const customerEmail = "shahsarjan968@gmail.com";

      const billingPeriod = isYearly ? "year" : "month";

      // 🔥 FIXED payload keys
      const { sessionId } = await createCheckoutSession(
        plan.id,
        billingPeriod,
        customerEmail
      );

      if (!sessionId) {
        throw new Error("Stripe session was not created");
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (err) {
      console.error("❌ Checkout error:", err);
      setError(err.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="d-flex align-items-center justify-content-center text-center text-white bg-primary shadow-lg mb-4"
        style={{
          minHeight: "25vh",
          backgroundImage:
            "linear-gradient(135deg, rgb(5,50,100), rgb(56,130,194))",
        }}
      >
        <div className="px-4">
          <h1 className="display-3 fw-bold">Choose Your Plan</h1>
          <p className="lead fw-semibold">
            Upgrade or downgrade anytime with no hidden fees.
          </p>
        </div>
      </div>

      <Container className="py-5">
        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}

        <Row className="justify-content-center mb-5">
          <Col className="text-center position-relative" xs="auto">
            <div className="d-inline-flex bg-light rounded-pill p-1 border position-relative">
              <Button
                variant={null}
                className={`rounded-pill px-4 py-2 fw-bold border-0 ${!isYearly ? "bg-white shadow-sm text-primary" : "text-muted"
                  }`}
                onClick={() => setIsYearly(false)}
              >
                Monthly
              </Button>
              <Button
                variant={null}
                className={`rounded-pill px-4 py-2 fw-bold border-0 ${isYearly ? "bg-white shadow-sm text-primary" : "text-muted"
                  }`}
                onClick={() => setIsYearly(true)}
              >
                Yearly
              </Button>

              <Badge
                bg="success"
                pill
                className="position-absolute top-0 start-100 translate-middle"
                style={{ fontSize: "0.8rem", border: "2px solid white", zIndex: 10 }}
              >
                Save 17%
              </Badge>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          {plans.map((plan) => (
            <Col lg={4} md={6} key={plan.id} className="mb-4">
              <Card
                className={`h-100 ${plan.popular ? "border-primary shadow-lg" : "shadow"
                  }`}
              >
                <Card.Body className="text-center p-4">
                  {plan.icon && (
                    <plan.icon size={40} className="mb-3 text-warning" />
                  )}
                  <h3>{plan.name}</h3>
                  <p className="text-muted">{plan.description}</p>

                  <h2 className="text-primary">
                    ₹{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    <small className="text-muted fs-6">
                      /{isYearly ? "year" : "month"}
                    </small>
                  </h2>

                  <ul className="list-unstyled text-start my-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="mb-2">
                        <FaCheck className="text-success me-2" /> {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="lg"
                    className="w-100"
                    variant={plan.buttonVariant}
                    disabled={loading}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {loading ? <Spinner size="sm" /> : plan.buttonText}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default Pricing;