import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Link } from "react-router-dom";

export default function OrderSuccessPage() {
  return (
    <>
      <div style={{ padding: "20px", textAlign: "center" }} className="page-container">
        <h1>Order Successful</h1>
        <p>Your order has been placed successfully.</p>
        <Link to="/products" className="btn">
          Continue Shopping
        </Link>
      </div>
    </>
  );
}