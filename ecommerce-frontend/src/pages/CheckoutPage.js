import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../api/orderApi";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const items = cart.items || [];

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      const { data } = await orderApi.checkout({ shippingAddress: address });
      await refreshCart();
      navigate(`/orders/${data.id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container empty-state">
        Your cart is empty. Add some products before checking out.
        <div><button className="btn-primary-small" onClick={() => navigate("/")}>Go to Shop</button></div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h2>Shipping Address</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <label>Full delivery address</label>
          <textarea
            required
            rows={4}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, City, State, ZIP, Country"
          />
          <button type="submit" className="btn-primary full-width" disabled={placing}>
            {placing ? "Placing Order..." : `Place Order — $${Number(cart.totalAmount).toFixed(2)}`}
          </button>
        </form>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          {items.map((item) => (
            <div className="summary-row" key={item.id}>
              <span>{item.product.name} × {item.quantity}</span>
              <span>${Number(item.subtotal).toFixed(2)}</span>
            </div>
          ))}
          <hr />
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${Number(cart.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
