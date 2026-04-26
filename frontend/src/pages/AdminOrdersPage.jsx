import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";

export default function AdminOrdersPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    
    fetch("http://127.0.0.1:5000/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
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

  const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status.");
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? data.order : order
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);

    const seconds = Math.floor((now - past) / 1000);

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  function printSingleOrder(orderId) {
    const printContent = document.getElementById(`invoice-${orderId}`).innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  }

  return (
    <div className="admin-orders-page">
      <h1>Admin Orders</h1>

      <button className="secondary-btn" onClick={handleLogout}>
        Logout
      </button>

      {loading && <p>Loading orders...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p>No orders have been placed yet.</p>
      )}

      <div className="orders-header">
        <h2>All Orders</h2>
        <button onClick={() => window.print()}>
          Print Orders
        </button>
      </div>

      {!loading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card" id={`invoice-${order.id}`}>
              <h3>Order #{order.id}</h3>

              <div className="invoice-header-row">
                <img src={logo} alt="Logo" className="invoice-logo" />

                <div className="invoice-info">
                  <h2>Chemical Brothers</h2>
                  <p>Invoice</p>
                  <p>Order #{order.id}</p>
                </div>
              </div>
              
              <button
                className="print-invoice-btn"
                onClick={() => printSingleOrder(order.id)}>
                  Print Invoice
              </button>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.created_at).toLocaleDateString()}
              </p>
              <p><strong>Name:</strong> {order.customer_name}</p>
              <p><strong>Email:</strong> {order.customer_email}</p>
              <p><strong>Phone:</strong> {order.phone}</p>
              <p><strong>Address:</strong> {order.address}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </p>

              <div className="status-actions">
                <button onClick={() => updateOrderStatus(order.id, "Pending")}>
                  Pending
                </button>

                <button onClick={() => updateOrderStatus(order.id, "Processing")}>
                  Processing
                </button>

                <button onClick={() => updateOrderStatus(order.id, "Delivered")}>
                  Delivered
                </button>
              </div>
              <p><strong>Subtotal:</strong> R{Number(order.subtotal).toFixed(2)}</p>
              <p><strong>Delivery Fee:</strong> R{Number(order.delivery_fee).toFixed(2)}</p>
              <p><strong>Total:</strong> R{Number(order.total).toFixed(2)}</p>

              <div className="order-items">
                <h4>Items Ordered</h4>

                <div className="order-items-header">
                  <span>Order Item</span>
                  <span>Quantity</span>
                  <span>Unit Price</span>
                  <span>Total</span>
                </div>

                

                {order.items?.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <span>{item.name}</span>
                    <span>{item.quantity}</span>
                    <span>R{Number(item.price).toFixed(2)}</span>
                    <span>R{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="invoice-totals">
                  <p>Subtotal: R{Number(order.subtotal).toFixed(2)}</p>
                  <p>Delivery: R{Number(order.delivery_fee).toFixed(2)}</p>
                  <h3>Total: R{Number(order.total).toFixed(2)}</h3>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}