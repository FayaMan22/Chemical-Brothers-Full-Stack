import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import formatCurrency from "../utils/formatCurrency";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const total = subtotal;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError("");

    const orderData = {
      customer_name: form.name,
      customer_email: form.email,
      phone: form.phone,
      address: form.address,
      items: cartItems,
      subtotal: subtotal,
      total: total,
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order.");
      }

      clearCart();
      navigate("/order-success", {
        state: {order: data.order}
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Customer Details</h2>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            value={form.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            required
            value={form.phone}
            onChange={handleChange}
          />

          <textarea
            name="address"
            placeholder="Delivery Address"
            required
            value={form.address}
            onChange={handleChange}
          />

          {error && <p className="checkout-error">{error}</p>}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div key={item.id} className="checkout-item">
              <div>
                <strong>{item.name}</strong>
                <p>Qty: {item.quantity}</p>
              </div>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}

          <hr />

          <div className="summary-row total-row">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}