import axios from "axios";

/**
 * Axios instance
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // e.g. https://parking-backend-pypn.onrender.com/api
});

/**
 * Request interceptor – attach access token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor – refresh token on 401
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await api.post("/users/token/refresh/", {
          refresh: refreshToken,
        });

        const newAccess = refreshResponse.data.access;
        localStorage.setItem("access_token", newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Logout helper
 */
const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/auth";
};

/* =========================
   AUTH
========================= */

export const loginUser = async (username, password) => {
  const response = await api.post("/users/login/", {
    username,
    password,
  });

  localStorage.setItem("access_token", response.data.access);
  localStorage.setItem("refresh_token", response.data.refresh);

  return response.data;
};

export const registerUser = async (username, email, password) => {
  const response = await api.post("/users/signup/", {
    username,
    email,
    password,
  });
  return response.data;
};

/* =========================
   PREMISES
========================= */

export const fetchPremises = async () => {
  const response = await api.get("/premises/");
  return response.data;
};

/* =========================
   BOOKINGS
========================= */

export const createBooking = async (bookingData) => {
  const response = await api.post("/bookings/bookings/", bookingData);
  return response.data;
};

export const fetchUserBookings = async () => {
  const response = await api.get("/bookings/user-bookings/");
  return response.data;
};

export const cancelBooking = async (bookingId) => {
  const response = await api.post(`/bookings/bookings/${bookingId}/cancel/`);
  return response.data;
};

export const completeBooking = async (bookingId) => {
  const response = await api.post(`/bookings/bookings/${bookingId}/complete/`);
  return response.data;
};

/* =========================
   PAYMENTS
========================= */

export const createCheckoutSession = async (planId, billingPeriod) => {
  const response = await api.post("/create-checkout-session/", {
    plan_id: planId,
    billing_period: billingPeriod,
    customer_email: "test@example.com"

  });
  return response.data;
};

export const verifyPayment = async (sessionId) => {
  const response = await api.get("/verify-payment/", {
    params: { session_id: sessionId },
  });
  return response.data;
};

/* =========================
   REVIEWS
========================= */

export const fetchReviews = async () => {
  const response = await api.get("/reviews/");
  return response.data;
};

export const submitReview = async (reviewData) => {
  const response = await api.post("/reviews/", reviewData);
  return response.data;
};

/* =========================
   CONTACT
========================= */

export const submitContact = async (contactData) => {
  const response = await api.post("/mess/contact/", contactData);
  return response.data;
};

export default api;
