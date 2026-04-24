import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { FaShoppingCart } from "react-icons/fa";
import logo from "../../assets/images/logo.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartItems } = useCart();

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const linkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <NavLink
        to="/"
        className="logo-container"
        onClick={() => setMenuOpen(false)}
      >
        <img src={logo} alt="Chemical Brothers Logo" className="logo-img" />
      </NavLink>

      <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <NavLink to="/" className={linkClass} onClick={() => setMenuOpen(false)}>
          Home
        </NavLink>

        <NavLink
          to="/products"
          className={linkClass}
          onClick={() => setMenuOpen(false)}
        >
          Products
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `${isActive ? "nav-link active" : "nav-link"} cart-link`
          }
          onClick={() => setMenuOpen(false)}
        >
          <FaShoppingCart className="cart-icon" />
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </NavLink>

        <NavLink
          to="/contact"
          className={linkClass}
          onClick={() => setMenuOpen(false)}
        >
          Contact
        </NavLink>
      </div>
    </nav>
  );
}