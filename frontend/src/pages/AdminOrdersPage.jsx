import { useEffect, useState } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/orders")
      .then((response) => response.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load orders.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="admin-orders-page">
      <h1>Admin Orders</h1>

      {loading && <p>Loading orders...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p>No orders have been placed yet.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <h3>Order #{order.id}</h3>

              <p><strong>Name:</strong> {order.customer_name}</p>
              <p><strong>Email:</strong> {order.customer_email}</p>
              <p><strong>Phone:</strong> {order.phone}</p>
              <p><strong>Address:</strong> {order.address}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Subtotal:</strong> R{Number(order.subtotal).toFixed(2)}</p>
              <p><strong>Delivery Fee:</strong> R{Number(order.delivery_fee).toFixed(2)}</p>
              <p><strong>Total:</strong> R{Number(order.total).toFixed(2)}</p>

              <div className="order-items">
                <h4>Items Ordered</h4>

                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <p><strong>Product:</strong> {item.name}</p>
                    <p><strong>Quantity:</strong> {item.quantity}</p>
                    <p><strong>Price:</strong> R{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}