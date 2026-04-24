import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="image-placeholder">No image yet</div>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>R{product.price}</p>
      <Link to={`/products/${product.id}`} className="btn">
        View
      </Link>
    </div>
  );
}