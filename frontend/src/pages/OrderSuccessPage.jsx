import { useLocation, useNavigate } from "react-router-dom";
import formatCurrency from "../utils/formatCurrency";

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const order = state?.order;

  if (!order) {
    return (
      <div className="order-success">
        <h2>No order data found</h2>
        <button onClick={() => navigate("/products")}>
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <main className="order-success">
      <h1>Order Placed Successfully ✅</h1>

      <div className="order-card">
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Name:</strong> {order.customer_name}</p>
        <p><strong>Email:</strong> {order.customer_email}</p>
        <p><strong>Phone:</strong> {order.phone}</p>
        <p><strong>Address:</strong> {order.address}</p>

        <h3>Total: {formatCurrency(order.total)}</h3>
        <p>Status: {order.status}</p>
      </div>

      <div className="order-actions">
        <button className="btn" onClick={() => navigate("/products")}>
          Continue Shopping
        </button>

        <button className="secondary-btn" onClick={() => window.print()}>
          Print Invoice
        </button>
      </div>
    </main>
  );
}