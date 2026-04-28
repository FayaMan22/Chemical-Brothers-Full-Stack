import { Link, useParams } from "react-router-dom";
import products from "../data/mockProducts";

export default function ProductDetailPage() {
  const { slug } = useParams();

  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return (
      <div className="page-container">
        <h2>Product not found.</h2>
        <Link to="/products" className="btn">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <img src={product.image} alt={product.name} />

      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p><strong>Category:</strong> {product.category}</p>
        <p><strong>Price:</strong> ${product.price}</p>

        <Link to="/products" className="btn">
          Back to Products
        </Link>
      </div>
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <Link to="/products" className="btn">
          ⬅ Back to Shop
        </Link>

        <Link to="/cart" className="btn">
          🛒 Go to Cart
        </Link>
      </div>
    </div>
  );
}