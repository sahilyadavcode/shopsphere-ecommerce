import React, { useEffect, useState, useCallback } from "react";
import { productApi, categoryApi } from "../api/productApi";
import ProductCard from "../components/ProductCard";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    categoryApi.getCategories().then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await productApi.getProducts({
        categoryId: selectedCategory || undefined,
        search: search || undefined,
        page,
        size: 12,
      });
      setProducts(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError("Could not load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadProducts();
  };

  return (
    <div className="container">
      <div className="shop-header">
        <h1>Discover Our Products</h1>
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-primary-small">Search</button>
        </form>
      </div>

      <div className="category-filters">
        <button
          className={`chip ${selectedCategory === null ? "chip-active" : ""}`}
          onClick={() => { setSelectedCategory(null); setPage(0); }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`chip ${selectedCategory === cat.id ? "chip-active" : ""}`}
            onClick={() => { setSelectedCategory(cat.id); setPage(0); }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">No products found.</div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</button>
              <span>Page {page + 1} of {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
