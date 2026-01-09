# PleaseLetMePark

A comprehensive, full‑stack parking booking platform designed to facilitate seamless reservations of parking spaces. The system features a robust **Django REST Framework** backend and a dynamic **React** frontend, integrating **Stripe** for secure payments and **Twilio** for real-time SMS notifications.

## Project Layout

```
pleaseletmepark/
├─ pleaseBack/              # Django backend (Django 5 / DRF / JWT / Stripe)
│  ├─ backend/              # Project settings and URLs
│  ├─ bookings/             # Booking creation, cancellation, completion logic
│  ├─ payments/             # Stripe checkout session & webhook verification
│  ├─ premises/             # Premise management (locations, availability)
│  ├─ reviews/              # User reviews and ratings
│  ├─ users/                # Authentication (Signup, Login, Refresh)
│  └─ manage.py
└─ pleaseFront/             # React app (CRA)
   └─ src/                  # UI pages, components, and service integrations
```

---

## Architecture & Technology Stack

We chose a modern, scalable stack to ensure reliability and developer experience.

-   **Backend: Django 5.2 & Django REST Framework (DRF)**
    -   *Why?* DRF provides powerful tools for serialization and auth out-of-the-box. The browsable API and Django's built-in admin interface significantly speed up development compared to micro-frameworks like Flask.
-   **Database: SQLite (Dev)**
    -   *Note*: Easily swappable for PostgreSQL in production without code changes thanks to Django's ORM.
-   **Authentication: JWT (SimpleJWT)**
    -   *Why?* Stateless authentication allows for better scalability and easier integration with mobile clients or third-party services compared to session-based auth.
-   **Payments: Stripe**
    -   *Why?* Industry leader for security, compliance, and developer experience. We use Stripe Checkout for a secure, hosted payment UI.
-   **Notifications: Twilio**
    -   *Why?* Reliable global SMS delivery to keep users updated on their booking status instantly.

---

## Core Features & Modules

### 1. User Management (`users/`)
-   **Registration & Auth**: Users sign up with email/password. Passwords are hashed securely.
-   **JWT Flow**: Upon login, users receive an Access Token (short-lived) and a Refresh Token (long-lived) to maintain sessions securely.

### 2. Premises Management (`premises/`)
-   **Geospatial Data**: Stores coordinates (lat/long) to render parking spots on a map.
-   **Availability Tracking**: Tracks total vs. available spots to prevent overbooking.
-   **Rich Metadata**: Includes images, features (CCTV, Covered, etc.), and pricing per hour.

### 3. Bookings System (`bookings/`)
-   **Smart Scheduling**: Automatically calculates end times based on duration.
-   **State Management**: Bookings move through defined states: `Confirmed` → `Completed` or `Cancelled`.
-   **Real-time Alerts**: Triggers Twilio SMS to the user immediately upon booking confirmation.

### 4. Payments (`payments/`)
-   **Secure Checkout**: specific endpoints create Stripe Checkout Sessions.
-   **Verification**: A dedicated verify endpoint checks the session status with Stripe before finalizing the transaction record in our database.
-   **Audit Trail**: Logs transaction IDs, amounts, and timestamps for every payment.

### 5. Reviews (`reviews/`)
-   **Quality Control**: Reviews can include a moderation flag (`is_approved`) to ensure content safety before being publicly visible.
-   **Rating System**: 1-5 star rating validation.

---

## Key Data Flows

### Booking Implementation Flow
1.  **User Search**: Frontend requests `/api/premises/`.
2.  **Selection**: User selects a spot. Frontend checks availability.
3.  **Booking Request**: User submits booking details (time, duration).
4.  **Creation**:
    -   Backend validates logic (is the spot actually free?).
    -   Calculates final price and timestamps.
    -   Saves `Booking` object with status `CONFIRMED`.
5.  **Notification**: Backend fires an async task to send SMS via Twilio.
6.  **Response**: Returns booking details to Frontend.

### Payment Implementation Flow
1.  **Selection**: User chooses a subscription/feature plan.
2.  **Session Creation**: Backend talks to Stripe API to generate a `checkout_session_id`.
3.  **Redirect**: Frontend redirects user to the Stripe hosted payment page.
4.  **Completion**: Stripe redirects user back to our `success_url`.
5.  **Verification**: Frontend calls `/api/verify-payment/`. Backend confirms with Stripe that payment succeeded and updates local records.

---

## Backend Setup (Django)

### Prerequisites
-   Python 3.11+
-   Virtual environment tool (venv)

### Quickstart

```bash
cd pleaseBack
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run migrations to set up SQLite DB
python manage.py migrate

# Optional: Create admin user
python manage.py createsuperuser

# Start Server
python manage.py runserver 0.0.0.0:8000
```
API available at: `http://localhost:8000/`

### Environment Variables (.env)
Create `pleaseBack/.env`:

```ini
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...

# Frontend URL (for Redirects)
FRONTEND_URL=http://localhost:3000

# Twilio (Optional)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Frontend Setup (React)

### Prerequisites
-   Node.js & npm/pnpm

### Quickstart

```bash
cd pleaseFront
npm install
npm start
```
App available at: `http://localhost:3000/`

### Environment Variables (`pleaseFront/.env`)
Optional overrides:

```ini
REACT_APP_API_BASE=http://localhost:8000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## API Routes Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **Auth** | | |
| `POST` | `/api/users/signup/` | Create a new user account |
| `POST` | `/api/users/login/` | Get JWT access/refresh tokens |
| `POST` | `/api/users/token/refresh/` | Refresh expired access token |
| **Premises** | | |
| `GET` | `/api/premises/` | List all parking premises |
| `GET` | `/api/premises/<id>/` | Get details for one premise |
| **Bookings** | | |
| `POST` | `/api/bookings/bookings/` | Create a new booking |
| `GET` | `/api/bookings/user-bookings/` | List current user's bookings |
| `POST` | `/api/bookings/bookings/<id>/cancel/` | Cancel a booking |
| **Payments** | | |
| `POST` | `/api/create-checkout-session/` | Init Stripe Checkout |
| `POST` | `/api/verify-payment/` | Confirm payment status |

---

## Production Roadmap & Recommendations

To prepare this project for a production environment, we recommend the following:

1.  **Database**: Switch `DATABASES` setting to use **PostgreSQL** for better data integrity and concurrency.
2.  **Security**:
    -   Set `DEBUG=False`.
    -   Configure `CORS_ALLOWED_ORIGINS` strictly.
    -   Implement **Rate Limiting** on auth endpoints to prevent brute-force.
3.  **Performance**:
    -   Use **Redis** for caching frequently accessed data (like Premise lists).
    -   Offload SMS sending to **Celery** tasks to avoid blocking API responses.
4.  **Deployment**:
    -   Use **Gunicorn** or **Uvicorn** behind **Nginx** for the backend.
    -   Serve Frontend static build via CDN or Nginx.

---

## License
MIT