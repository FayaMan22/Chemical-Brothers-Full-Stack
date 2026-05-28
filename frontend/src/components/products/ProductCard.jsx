import { Link } from "react-router-dom";
import formatCurrency from "../../utils/formatCurrency";
import { useCart } from "../../context/CartContext";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <div className="product-card">
      <div className="product-image-box">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <span>No image yet</span>
        )}
      </div>

      <div className="product-card-content">
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <p className="product-price">{formatCurrency(product.price)}</p>

        <div className="product-actions">
          <Link to={`/products/${product.id}`} className="product-btn">
            View
          </Link>

          <button className={`cart-btn ${added ? "added" : ""}`} 
                  onClick={() => {
                    addToCart(product);
                    setAdded(true);
                    setTimeout(() => setAdded(false), 1200);
                    }}>
                    {added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}