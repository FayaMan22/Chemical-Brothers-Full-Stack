import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import formatCurrency from "../utils/formatCurrency";

function TrackOrderPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("Loading order...");

  useEffect(() => {
    fetch(`https://chemical-brothers-full-stack.onrender.com/orders/${orderId}/tracking`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.order);
          setMessage("");
        } else {
          setMessage(data.message);
        }
      })
      .catch(() => {
        setMessage("Could not load order tracking details.");
      });
  }, [orderId]);

  if (message) {
    return <h2 style={{ textAlign: "center" }}>{message}</h2>;
  }

  const statusSteps = ["Pending", "Processing", "Out for Delivery", "Delivered"];
  const currentStepIndex = statusSteps.indexOf(order.status);


  return (
    <main className="tracking-page">
      <section className="tracking-card">
        <h1>Track Your Order</h1>

        <p><strong>Order ID:</strong> #{order.id}</p>
        <p><strong>Customer:</strong> {order.customer_name}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <div clasName="status-progress">
          {statusSteps.map((step, index) => (
            <div
              key={step}
              className={`status-step ${
                index <= currentStepIndex ? "active" : ""
              }`}>
                <div className="status-circle">
                  {index <= currentStepIndex ? "✓" : index + 1}
                </div>
                <p>{step}</p>
              </div>
          ))}
        </div>
        <p><strong>Created:</strong> {order.created_at}</p>
        <p><strong>Total:</strong> {formatCurrency(order.total)}</p>

        <a
          className="whatsapp-link"
          href="https://wa.me/+263772912789"
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp Us
        </a>
      </section>
    </main>
  );
}

export default TrackOrderPage;