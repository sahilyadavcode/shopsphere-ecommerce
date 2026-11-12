import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [busyItemId, setBusyItemId] = useState(null);

  const handleQuantityChange = async (itemId, quantity) => {
    if (quantity < 1) return;
    setBusyItemId(itemId);
    try {
      await updateQuantity(itemId, quantity);
    } finally {
      setBusyItemId(null);
    }
  };

  const handleRemove = async (itemId) => {
    setBusyItemId(itemId);
    try {
      await removeItem(itemId);
    } finally {
      setBusyItemId(null);
    }
  };

  if (loading) return <div className="container loading-state">Loading cart...</div>;

  const items = cart.items || [];

  return (
    <div className="container">
      <h1>Your Cart</h1>

      {items.length === 0 ? (
        <div className="empty-state">
          Your cart is empty.
          <div><button className="btn-primary-small" onClick={() => navigate("/")}>Continue Shopping</button></div>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div className="cart-item" key={item.id}>
                <img src={item.product.imageUrl || "https://placehold.co/100x100"} alt={item.product.name} />
                <div className="cart-item-info">
                  <h3>{item.product.name}</h3>
                  <p>${Number(item.product.price).toFixed(2)} each</p>
                </div>
                <div className="cart-item-qty">
                  <button
                    disabled={busyItemId === item.id}
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  >-</button>
                  <span>{item.quantity}</span>
                  <button
                    disabled={busyItemId === item.id}
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >+</button>
                </div>
                <div className="cart-item-subtotal">${Number(item.subtotal).toFixed(2)}</div>
                <button
                  className="btn-link btn-danger"
                  disabled={busyItemId === item.id}
                  onClick={() => handleRemove(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Total</span>
              <span>${Number(cart.totalAmount).toFixed(2)}</span>
            </div>
            <button className="btn-primary full-width" onClick={() => navigate("/checkout")}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
