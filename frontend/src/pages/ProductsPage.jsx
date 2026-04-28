import { useState } from "react";
import ProductGrid from "../components/products/ProductGrid";
import SearchBar from "../components/products/SearchBar";
import products from "../data/mockProducts";

function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...new Set(products.map((product) => product.category))];

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

      {filteredProducts.length === 0 ? (
        <p className="no-products">No products found.</p>
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </main>
  );
}

export default ProductsPage;