import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container, Alert, Button, Spinner, Card,
  ListGroup
} from 'react-bootstrap';
import { CheckCircleFill, ClockHistory } from 'react-bootstrap-icons';
import { verifyPayment } from '../api';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  const [state, setState] = useState({
    loading: true,
    error: null,
    payment: null
  });

  useEffect(() => {
    const verifyPayment = async () => {
      const query = new URLSearchParams(location.search);
      const sessionId = query.get('session_id');

      if (!sessionId) {
        setState({ loading: false, error: 'Missing payment session ID', payment: null });
        return;
      }

      try {
        const data = await verifyPayment(sessionId);

        if (data.status === 'success') {
          setState({
            loading: false,
            error: null,
            payment: {
              id: data.payment_id,
              amount: data.amount,
              currency: data.currency,
              plan: data.plan_id,
              period: data.billing_period,
              nextBilling: data.next_billing_date,
              status: data.payment_status
            }
          });
        } else {
          setState({
            loading: false,
            error: data.message || 'Payment verification failed',
            payment: null
          });
        }
      } catch (err) {
        setState({
          loading: false,
          error: err.message || 'Payment verification error',
          payment: null
        });
      }
    };

    verifyPayment();
  }, [location]);

  if (state.loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted fw-semibold">Verifying your payment...</p>
      </Container>
    );
  }

  if (state.error) {
    return (
      <Container className="py-5 d-flex justify-content-center">
        <Card className="shadow-lg p-4 border-0 rounded-3" style={{ maxWidth: '500px', width: '100%' }}>
          <Alert variant="danger" className="text-center mb-4 rounded">
            <Alert.Heading className="fw-bold">❌ Payment Verification Failed</Alert.Heading>
            <p className="fw-semibold">{state.error}</p>
          </Alert>
          <div className="d-flex gap-3 justify-content-center">
            <Button variant="outline-danger" onClick={() => navigate('/pricing')}>
              Back to Pricing
            </Button>
            <Button variant="danger" onClick={() => window.location.reload()}>
              <ClockHistory className="me-2" />
              Try Again
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <>
      {/* 🎉 Confetti Animation */}
      <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />

      <Container className="py-5 d-flex justify-content-center">
        <Card 
          className="shadow-lg border-0 rounded-4 overflow-hidden text-center"
          style={{ maxWidth: '650px', width: '100%' }}
        >
          {/* Gradient Header */}
          <div className="bg-primary text-white py-5 px-4 position-relative">
            <CheckCircleFill size={65} className="mb-3" />
            <h2 className="fw-bold mb-2">Payment Successful 🎉</h2>
            <p className="mb-0 fs-5 fw-semibold">
              Your <span className="text-warning">{state.payment.plan}</span> plan is now active
            </p>
          </div>

          <Card.Body className="p-4">
            <ListGroup variant="flush" className="mb-4">
              <ListGroup.Item className="py-3 fs-6 fw-semibold">
                Payment ID:&nbsp;
                <span className="text-dark">{state.payment.id || 'N/A'}</span>
              </ListGroup.Item>
              <ListGroup.Item className="py-3 fs-6 fw-semibold">
                Amount Paid:&nbsp; 
                <span className="text-primary fw-bold">
                  {state.payment.amount} {state.payment.currency}
                </span>
              </ListGroup.Item>
              <ListGroup.Item className="py-3 fs-6 fw-semibold">
                Plan:&nbsp; 
                <span className="text-dark">
                  {state.payment.plan} ({state.payment.period})
                </span>
              </ListGroup.Item>
              {state.payment.nextBilling && (
                <ListGroup.Item className="py-3 fs-6 fw-semibold">
                  Next Billing Date:&nbsp; 
                  <span className="text-dark">
                    {new Date(state.payment.nextBilling).toLocaleDateString()}
                  </span>
                </ListGroup.Item>
              )}
              <ListGroup.Item className="py-3 fs-6 fw-semibold">
                Status:&nbsp; 
                <span className={state.payment.status === 'paid' ? "text-success fw-bold" : "text-warning fw-bold"}>
                  {state.payment.status}
                </span>
              </ListGroup.Item>
            </ListGroup>

            <div className="text-center">
              <Button 
                variant="primary"
                size="lg"
                className="px-5 fw-bold rounded-pill"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default Success;
