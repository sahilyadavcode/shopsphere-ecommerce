import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password);
      navigate("/");
    } catch (err) {
      const details = err.response?.data?.details;
      setError(details ? details.join(", ") : err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join us and start shopping</p>

        {error && <div className="alert alert-error">{error}</div>}

        <label>Full Name</label>
        <input type="text" name="fullName" required value={form.fullName} onChange={handleChange} />

        <label>Email</label>
        <input type="email" name="email" required value={form.email} onChange={handleChange} />

        <label>Password</label>
        <input type="password" name="password" required minLength={6} value={form.password} onChange={handleChange} />

        <button type="submit" className="btn-primary full-width" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
