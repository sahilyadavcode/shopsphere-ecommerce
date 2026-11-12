import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../api/orderApi";

const statusColors = {
  PENDING: "status-pending",
  CONFIRMED: "status-confirmed",
  SHIPPED: "status-shipped",
  DELIVERED: "status-delivered",
  CANCELLED: "status-cancelled",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMyOrders({ page: 0, size: 20 })
      .then(({ data }) => setOrders(data.content))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container loading-state">Loading orders...</div>;

  return (
    <div className="container">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          You haven't placed any orders yet.
          <div><Link to="/" className="btn-primary-small">Start Shopping</Link></div>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link to={`/orders/${order.id}`} className="order-row" key={order.id}>
              <div>
                <strong>Order #{order.id}</strong>
                <p>{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>{order.items.length} item(s)</div>
              <div className={`status-badge ${statusColors[order.status] || ""}`}>{order.status}</div>
              <div className="order-total">${Number(order.totalAmount).toFixed(2)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
