import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productApi } from "../api/productApi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    productApi.getProductById(id)
      .then(({ data }) => setProduct(data))
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await addToCart(product.id, quantity);
      setMessage("Added to cart!");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add to cart");
    }
  };

  if (loading) return <div className="container loading-state">Loading...</div>;
  if (error) return <div className="container alert alert-error">{error}</div>;
  if (!product) return null;

  const outOfStock = product.stockQuantity <= 0;

  return (
    <div className="container">
      <button className="btn-link" onClick={() => navigate(-1)}>&larr; Back</button>
      <div className="product-detail">
        <div className="product-detail-image">
          <img src={product.imageUrl || "https://placehold.co/500x500?text=No+Image"} alt={product.name} />
        </div>
        <div className="product-detail-info">
          {product.category && <span className="product-category">{product.category.name}</span>}
          <h1>{product.name}</h1>
          <p className="product-price-large">${Number(product.price).toFixed(2)}</p>
          <p className="product-description">{product.description}</p>
          <p className="stock-info">
            {outOfStock ? "Out of stock" : `${product.stockQuantity} units available`}
          </p>

          {!outOfStock && (
            <div className="quantity-selector">
              <label htmlFor="qty">Quantity</label>
              <input
                id="qty"
                type="number"
                min="1"
                max={product.stockQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              />
            </div>
          )}

          <button className="btn-primary" onClick={handleAddToCart} disabled={outOfStock}>
            {message || (outOfStock ? "Unavailable" : "Add to Cart")}
          </button>
        </div>
      </div>
    </div>
  );
}
