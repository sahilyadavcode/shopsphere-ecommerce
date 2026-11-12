import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { orderApi } from "../api/orderApi";

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    orderApi.getOrderById(id)
      .then(({ data }) => setOrder(data))
      .catch(() => setError("Order not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container loading-state">Loading order...</div>;
  if (error) return <div className="container alert alert-error">{error}</div>;
  if (!order) return null;

  return (
    <div className="container">
      {location.state?.justPlaced && (
        <div className="alert alert-success">🎉 Your order has been placed successfully!</div>
      )}

      <h1>Order #{order.id}</h1>
      <p className="order-meta">
        Placed on {new Date(order.createdAt).toLocaleString()} &middot; Status: <strong>{order.status}</strong>
      </p>
      <p className="order-meta">Shipping to: {order.shippingAddress}</p>

      <div className="order-items-list">
        {order.items.map((item) => (
          <div className="cart-item" key={item.id}>
            <img src={item.product.imageUrl || "https://placehold.co/100x100"} alt={item.product.name} />
            <div className="cart-item-info">
              <h3>{item.product.name}</h3>
              <p>${Number(item.priceAtPurchase).toFixed(2)} × {item.quantity}</p>
            </div>
            <div className="cart-item-subtotal">
              ${(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row summary-total">
          <span>Total</span>
          <span>${Number(order.totalAmount).toFixed(2)}</span>
        </div>
      </div>

      <Link to="/orders" className="btn-link">&larr; Back to Orders</Link>
    </div>
  );
}
