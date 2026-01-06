# PleaseLetMePark

A full‑stack parking booking platform with a Django REST API backend and a React frontend. Supports JWT auth, premises browsing, bookings, reviews, and Stripe payments.

### Project layout
```
pleaseletmepark/
├─ pleaseBack/              # Django backend (Django 5 / DRF / JWT / Stripe)
│  ├─ backend/              # Project settings and URLs
│  ├─ bookings/             # Booking creation, cancel, complete, list
│  ├─ payments/             # Stripe checkout + verification
│  ├─ premises/             # Premise list & detail
│  ├─ reviews/              # Review list/create
│  ├─ users/                # Signup, login, token refresh
│  └─ manage.py
└─ pleaseFront/             # React app (CRA)
   └─ src/                  # UI pages and components
```

---

## Backend (Django + DRF)

- Python 3.11+ recommended
- Django REST Framework and JWT (SimpleJWT)
- CORS enabled for the frontend dev server
- SQLite dev database by default

### Quickstart

```bash
cd pleaseBack
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install --upgrade pip
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers python-dotenv stripe twilio

python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py runserver 0.0.0.0:8000
```

The API will be available at `http://localhost:8000/`.

### Environment variables (.env)
Place a `.env` file inside `pleaseBack/` (same level as `manage.py`) with:

```env
# Django
SECRET_KEY=change-me-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLIC_KEY=pk_test_xxx

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000

# Twilio (optional if you use messaging)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

Relevant settings highlights from `backend/settings.py`:
- `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000` and `http://127.0.0.1:3000`
- `REST_FRAMEWORK.DEFAULT_AUTHENTICATION_CLASSES` uses JWT
- Uses SQLite dev DB by default

### API routes
Base prefix for most apps is `/api/`. Below is a concise list derived from the URL configs.

- Auth (`/api/users/`)
  - `POST /api/users/signup/` — create user
  - `POST /api/users/login/` — obtain JWT pair
  - `POST /api/users/token/refresh/` — refresh JWT

- Premises (`/api/`)
  - `GET /api/premises/` — list premises
  - `GET /api/premises/<id>/` — premise detail

- Bookings (`/api/bookings/`)
  - `POST /api/bookings/bookings/` — create booking
  - `POST /api/bookings/bookings/<booking_id>/cancel/` — cancel booking
  - `POST /api/bookings/bookings/<booking_id>/complete/` — mark complete
  - `GET  /api/bookings/user-bookings/` — list user bookings

- Payments (`/api/`)
  - `POST /api/create-checkout-session/` — create Stripe checkout session
  - `POST /api/verify-payment/` — verify payment

- Reviews (`/api/`)
  - `GET  /api/reviews/` — list reviews
  - `POST /api/reviews/` — create review

- Admin
  - `GET /admin/` — Django admin

Note: Some endpoints likely require Authorization: `Bearer <access_token>`.

---

## Frontend (React)

- Create React App with `react-scripts`
- Uses `axios`, `react-router-dom`, `bootstrap`, `leaflet`/`react-leaflet`, and Stripe JS
- Dev server proxies API to `http://localhost:8000` (see `pleaseFront/package.json` "proxy")

### Quickstart

```bash
cd pleaseFront
npm install
npm start
```

The app will be available at `http://localhost:3000/`.

### Environment
If needed in the frontend, create `pleaseFront/.env` (optional):
```env
# Example: override the proxy or provide public keys
REACT_APP_API_BASE=http://localhost:8000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxx
```

---

## Development workflow

- Start backend first on port 8000
- Start frontend on port 3000; the proxy forwards unknown paths to the backend
- Use JWT login from the frontend or via API clients to hit protected endpoints

### Common commands
```bash
# Backend
cd pleaseBack
source .venv/bin/activate
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

# Frontend
cd pleaseFront
npm start
npm run build
```

---

## Testing

- Backend: add tests under each Django app's `tests.py`, run with `python manage.py test`
- Frontend: `npm test`

---

## Deployment notes (high‑level)

- Set `DEBUG=False` and configure `ALLOWED_HOSTS`
- Use a production database and a proper static files setup (e.g., WhiteNoise or a CDN)
- Provide real `STRIPE_SECRET_KEY`/`STRIPE_PUBLIC_KEY`
- Serve the React build via a static host or reverse proxy (e.g., Nginx) and point it to the backend API
- Secure the Django `SECRET_KEY` and all credentials in your hosting environment

---

## Troubleshooting

- 401/403 responses: ensure you include `Authorization: Bearer <access_token>`
- CORS errors: confirm `CORS_ALLOWED_ORIGINS` and frontend origin match
- Stripe errors: verify keys and that the backend is reachable on the callback URLs

---

## License

MIT or proprietary — update as appropriate for your project. 