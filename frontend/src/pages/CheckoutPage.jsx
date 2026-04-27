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
      navigate("/order-success");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }} className="page-container">
      <h1>Checkout</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          required
          value={form.name}
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          required
          value={form.phone}
          onChange={handleChange}
        />
        <br /><br />

        <textarea
          name="address"
          placeholder="Delivery Address"
          required
          value={form.address}
          onChange={handleChange}
        />
        <br /><br />

        <h3>Subtotal: {formatCurrency(subtotal)}</h3>
        <h2>Total: {formatCurrency(total)}</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}