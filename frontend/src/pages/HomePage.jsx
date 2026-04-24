import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/images/products.png";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <>
      <div className="page-container">
        <section className="hero">
          <div className="hero-left">
            <h1>Powerful Cleaning. Fresh Results. Every Time.</h1>
            <p>
              Premium detergent solutions designed for deep cleaning, lasting freshness,
              and everyday care for your home and business.
            </p>
            <button className="shop-btn" onClick={() => navigate("./products")}>Shop Now</button>
          </div>

          <div className="hero-right">
            <img src={heroImage} alt="Detergent product" className="hero-image" />
          </div>
        </section>

        <section className="features">
          <div className="feature">
            <h3>High Quality</h3>
            <p>Effective and reliable cleaning products</p>
          </div>
          <div className="feature">
            <h3>Affordable</h3>
            <p>Best value for your money</p>
          </div>
          <div className="feature">
            <h3>Bulk Supply</h3>
            <p>Available for businesses and institutions</p>
          </div>
        </section>
      </div>
    </>
  );
}