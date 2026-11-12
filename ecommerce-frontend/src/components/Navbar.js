import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          🛍️ ShopSphere
        </Link>

        <div className="nav-links">
          <Link to="/">Shop</Link>
          {user && <Link to="/orders">My Orders</Link>}
          {isAdmin && <Link to="/admin">Admin</Link>}
        </div>

        <div className="nav-right">
          {user && (
            <Link to="/cart" className="cart-link">
              🛒 Cart
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          )}
          {user ? (
            <div className="user-menu">
              <span className="user-name">Hi, {user.fullName.split(" ")[0]}</span>
              <button className="btn-link" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary-small">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
