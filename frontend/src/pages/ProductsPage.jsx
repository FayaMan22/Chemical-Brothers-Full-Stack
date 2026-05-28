import { useEffect, useState } from "react";
import ProductGrid from "../components/products/ProductGrid";
import SearchBar from "../components/products/SearchBar";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data.products || data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products.");
        setLoading(false);
      });
  }, []);

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((product) =>
      selectedCategory === "All" ? true : product.category === selectedCategory
    );

  return (
    <main className="products-page">
      <section className="products-header">
        <h1>Our Products</h1>
        <p>
          Explore our range of cleaning, hygiene, automotive, packaging, and
          specialist chemical solutions.
        </p>
      </section>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={selectedCategory === category ? "active-category" : ""}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading products...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      {!loading && !error && filteredProducts.length === 0 && (
        <p className="no-products">No products found.</p>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <ProductGrid products={filteredProducts} />
      )}
    </main>
  );
}

export default ProductsPage;