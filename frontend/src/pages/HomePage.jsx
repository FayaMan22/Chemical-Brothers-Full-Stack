import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useNavigate } from "react-router-dom";

import heroImage from "../assets/images/products.png";
import promo1 from "../assets/images/image1.jpeg";
import promo2 from "../assets/images/image2.jpeg";
import promo3 from "../assets/images/image3.jpeg";

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
            <button className="shop-btn" onClick={() => navigate("/products")}>
              Shop Now
            </button>
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

        <section className="promo-section">
          <div className="promo-intro">
            <h2>Cleaning Solutions for Every Space</h2>
            <p>
              From homes to businesses, our products are made to deliver reliable
              cleaning power every day.
            </p>
          </div>

          <div className="promo-grid">
            <div className="promo-card">
              <img src={promo1} alt="Chemical Brothers dishwashing liquid" />
              <h3>Powerful Formula</h3>
              <p>Designed to cut through grease and leave dishes sparkling clean.</p>
            </div>

            <div className="promo-card">
              <img src={promo2} alt="Easy cleaning dishwashing liquid" />
              <h3>Easy Everyday Cleaning</h3>
              <p>Perfect for kitchens, homes, restaurants, and daily use.</p>
            </div>

            <div className="promo-card">
              <img src={promo3} alt="Chemical Brothers supply team" />
              <h3>Reliable Supply</h3>
              <p>Ready for households, retailers, businesses, and bulk orders.</p>
            </div>
            <div className="promo-cta">
              <button className="shop-btn" onClick={() => navigate("/products")}>
                View Our Products
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}