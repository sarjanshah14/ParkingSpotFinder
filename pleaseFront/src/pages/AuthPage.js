import { useState } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api";
// Add these imports at the top
import * as d3 from 'd3';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState(""); // track which field is focused

  const navigate = useNavigate();
  const primaryColor = "rgb(9, 184, 247)";

  const [validation, setValidation] = useState({
    username: false,
    email: false,
    passwordLength: false,
    passwordUppercase: false,
    passwordNumber: false,
    passwordSpecial: false,
    confirmPassword: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (!isLogin) {
      switch (name) {
        case "username":
          setValidation((prev) => ({ ...prev, username: value.length >= 3 }));
          break;
        case "email":
          setValidation((prev) => ({
            ...prev,
            email: /^\S+@\S+\.\S+$/.test(value),
          }));
          break;
        case "password":
          setValidation((prev) => ({
            ...prev,
            passwordLength: value.length >= 8,
            passwordUppercase: /[A-Z]/.test(value),
            passwordNumber: /\d/.test(value),
            passwordSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value),
            confirmPassword: value === form.confirmPassword,
          }));
          break;
        case "confirmPassword":
          setValidation((prev) => ({
            ...prev,
            confirmPassword: value === form.password,
          }));
          break;
        default:
          break;
      }
    }
  };

  const handleFocus = (e) => {
    setActiveField(e.target.name);
  };

  const handleBlur = () => {
    setActiveField("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.username || !form.password || (!isLogin && !form.email)) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (!isLogin) {
      const allValid = Object.values(validation).every((v) => v === true);
      if (!allValid) {
        setError("Please meet all signup requirements before continuing.");
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        const data = await loginUser(form.username, form.password);

        localStorage.setItem("token", data.access);
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refreshToken", data.refresh);

        navigate("/dashboard");
      } else {
        await registerUser(form.username, form.email, form.password);
        setIsLogin(true);
        setForm({ username: "", email: "", password: "", confirmPassword: "" });
        setError("");
        alert("Signup successful! Please login.");
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    }

    setLoading(false);
  };

  // Bulleted list for a field's validation with color
  const renderBulletList = (rules) => (
    <ul style={{ paddingLeft: "1.2rem", marginTop: "0.2rem", fontSize: "0.9rem" }}>
      {rules.map(({ valid, text }, i) => (
        <li key={i} style={{ color: valid ? "green" : "red" }}>
          {text}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="auth-page d-flex align-items-center" style={{ marginTop: "100px", marginBottom: "100px" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="row g-0">
                {/* Left Side - Welcome */}
                <div
                  className="col-lg-6 d-flex align-items-center"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, rgb(2, 128, 172) 100%)`,
                    color: "white",
                  }}
                >
                  <div className="p-5 text-center">
                    <h1 className="display-4 fw-bold mb-4">Welcome to LetsPark</h1>
                    <p className="lead mb-4">
                      Your ultimate parking solution. Find, book, and manage your parking spots with ease.
                    </p>
                  </div>
                </div>

                {/* Right Side - Auth Forms */}
                <div className="col-lg-6 bg-white">
                  <div className="p-5">
                    {/* Toggle Buttons */}
                    <div className="d-flex mb-4">
                      <Button
                        className="flex-fill me-2"
                        style={{
                          backgroundColor: isLogin ? primaryColor : "white",
                          borderColor: primaryColor,
                          color: isLogin ? "white" : primaryColor,
                          fontWeight: "bold",
                        }}
                        onClick={() => {
                          setIsLogin(true);
                          setError("");
                        }}
                      >
                        Login
                      </Button>
                      <Button
                        className="flex-fill"
                        style={{
                          backgroundColor: !isLogin ? primaryColor : "white",
                          borderColor: primaryColor,
                          color: !isLogin ? "white" : primaryColor,
                          fontWeight: "bold",
                        }}
                        onClick={() => {
                          setIsLogin(false);
                          setError("");
                        }}
                      >
                        Sign Up
                      </Button>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    {isLogin ? (
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Username</Form.Label>
                          <Form.Control
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            required
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                          />
                        </Form.Group>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-100 py-3 mb-3"
                          style={{
                            backgroundColor: primaryColor,
                            borderColor: primaryColor,
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                          }}
                        >
                          {loading ? "Logging in..." : "🔓 Login"}
                        </Button>
                      </Form>
                    ) : (
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Username</Form.Label>
                          <Form.Control
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder="Choose a username"
                            required
                          />
                          {activeField === "username" &&
                            renderBulletList([
                              { valid: validation.username, text: "At least 3 characters" },
                            ])}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder="Enter your email"
                            required
                          />
                          {activeField === "email" &&
                            renderBulletList([
                              { valid: validation.email, text: "Must be valid email format" },
                            ])}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder="Create a password"
                            required
                          />
                          {activeField === "password" &&
                            renderBulletList([
                              { valid: validation.passwordLength, text: "At least 8 characters" },
                              { valid: validation.passwordUppercase, text: "Contains uppercase letter" },
                              { valid: validation.passwordNumber, text: "Contains a number" },
                              { valid: validation.passwordSpecial, text: "Contains special character" },
                            ])}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Confirm Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder="Confirm your password"
                            required
                          />
                          {activeField === "confirmPassword" &&
                            renderBulletList([
                              { valid: validation.confirmPassword, text: "Passwords match" },
                            ])}
                        </Form.Group>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-100 py-3 mb-3"
                          style={{
                            backgroundColor: primaryColor,
                            borderColor: primaryColor,
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                          }}
                        >
                          {loading ? "Signing up..." : "🚀 Sign Up"}
                        </Button>

                        <div className="text-center small text-muted">
                          Already have an account?{" "}
                          <Button
                            variant="link"
                            style={{
                              color: primaryColor,
                              textDecoration: "none",
                              padding: 0,
                            }}
                            onClick={() => {
                              setIsLogin(true);
                              setError("");
                            }}
                          >
                            Login here
                          </Button>
                        </div>
                      </Form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
