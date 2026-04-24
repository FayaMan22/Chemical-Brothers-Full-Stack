import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/products/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Product not found");
        }
        return response.json();
      })
      .then((data) => {
        setProduct(data.product);
        setLoading(false);
      })
      .catch(() => {
        setError("Product not found.");
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product);
    setMessage("Added to cart!");

    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading product...</p>;
  }

  if (error) {
    return <h2 style={{ textAlign: "center" }}>{error}</h2>;
  }

  return (
    <div className="product-detail">
      <div className="image-placeholder">Image coming soon</div>

      <div className="product-info">
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p>Category: {product.category}</p>
        <p>Stock: {product.stock}</p>
        <p>R{product.price}</p>

        <div className="product-actions">
          <button className="btn" onClick={handleAddToCart}>
            Add to Cart
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/products")}
          >
            Back to Shop
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/cart")}
          >
            Go to Cart
          </button>
        </div>

        {message && <p className="cart-message">{message}</p>}
      </div>
    </div>
  );
}