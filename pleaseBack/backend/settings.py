"""
Django settings for backend project.
Production-ready for Render + PostgreSQL
"""

from pathlib import Path
import os
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

# ------------------------------------------------------------------------------
# Base paths
# ------------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent


# ------------------------------------------------------------------------------
# Core settings
# ------------------------------------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = os.getenv("DEBUG") == "True"

ALLOWED_HOSTS = [
    "parking-backend-pypn.onrender.com",
    ".onrender.com",
    
]


# ------------------------------------------------------------------------------
# Installed apps
# ------------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",

    # Local apps
    "users",
    "premises",
    "bookings",
    "payments",
    "reviews",
    "mess",
]


# ------------------------------------------------------------------------------
# Middleware
# ------------------------------------------------------------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware',
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ------------------------------------------------------------------------------
# URLs / WSGI
# ------------------------------------------------------------------------------
ROOT_URLCONF = "backend.urls"

WSGI_APPLICATION = "backend.wsgi.application"


# ------------------------------------------------------------------------------
# Templates
# ------------------------------------------------------------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ------------------------------------------------------------------------------
# Database (PostgreSQL via Render)
# ------------------------------------------------------------------------------
DATABASES = {
    "default": dj_database_url.config(
        default=os.getenv("DATABASE_URL"),
        conn_max_age=600,
        ssl_require=os.getenv("DATABASE_URL", "").startswith("postgres"),
    )
}



# ------------------------------------------------------------------------------
# Password validation
# ------------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ------------------------------------------------------------------------------
# Internationalization
# ------------------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# ------------------------------------------------------------------------------
# Static files
# ------------------------------------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"


# ------------------------------------------------------------------------------
# Default PK
# ------------------------------------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ------------------------------------------------------------------------------
# Django REST Framework / JWT
# ------------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}


# ------------------------------------------------------------------------------
# CORS
# ------------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://parkingspotfinder.onrender.com",
]

CORS_ALLOW_CREDENTIALS = True

STRIPE_BASIC_MONTH = os.getenv("STRIPE_BASIC_MONTH")
STRIPE_BASIC_YEAR = os.getenv("STRIPE_BASIC_YEAR")
STRIPE_STANDARD_MONTH = os.getenv("STRIPE_STANDARD_MONTH")
STRIPE_STANDARD_YEAR = os.getenv("STRIPE_STANDARD_YEAR")
STRIPE_PREMIUM_MONTH = os.getenv("STRIPE_PREMIUM_MONTH")
STRIPE_PREMIUM_YEAR = os.getenv("STRIPE_PREMIUM_YEAR")

FRONTEND_SUCCESS_URL = os.getenv("FRONTEND_SUCCESS_URL", "https://parkingspotfinder.onrender.com/success")
FRONTEND_CANCEL_URL = os.getenv("FRONTEND_CANCEL_URL", "https://parkingspotfinder.onrender.com/pricing")

# ------------------------------------------------------------------------------
# Stripe
# ------------------------------------------------------------------------------
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLIC_KEY = os.getenv("STRIPE_PUBLIC_KEY")


# ------------------------------------------------------------------------------
# Frontend
# ------------------------------------------------------------------------------
FRONTEND_URL = os.getenv("FRONTEND_URL")


# ------------------------------------------------------------------------------
# Twilio
# ------------------------------------------------------------------------------
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")


# ------------------------------------------------------------------------------
# Logging
# ------------------------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
