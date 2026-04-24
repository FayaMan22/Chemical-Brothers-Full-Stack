import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <h2>Your cart is empty</h2>
        <button className="btn" onClick={() => navigate("/products")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>

      {cartItems.map((item) => (
        <div key={item.id} className="cart-item">
          <div className="cart-item-info">
            <h3>{item.name}</h3>
            <p>R{item.price}</p>
            <p>Subtotal: R{(item.price * item.quantity).toFixed(2)}</p>
          </div>

          <div className="cart-item-controls">
            <button onClick={() => decreaseQuantity(item.id)}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => increaseQuantity(item.id)}>+</button>
          </div>

          <button
            className="remove-btn"
            onClick={() => removeFromCart(item.id)}
          >
            Remove
          </button>
        </div>
      ))}

      <div className="cart-summary">
        <h3>Total: R{cartTotal.toFixed(2)}</h3>

        <div className="cart-summary-actions">
          <button
            className="secondary-btn"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>

          <button className="btn" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}