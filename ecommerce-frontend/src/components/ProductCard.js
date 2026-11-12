import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    setAdding(true);
    setMessage("");
    try {
      await addToCart(product.id, 1);
      setMessage("Added!");
      setTimeout(() => setMessage(""), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const outOfStock = product.stockQuantity <= 0;

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
      <div className="product-image-wrap">
        <img src={product.imageUrl || "https://placehold.co/400x400?text=No+Image"} alt={product.name} />
        {outOfStock && <span className="badge-out-of-stock">Out of stock</span>}
      </div>
      <div className="product-info">
        {product.category && <span className="product-category">{product.category.name}</span>}
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">${Number(product.price).toFixed(2)}</p>
        <button
          className="btn-primary-small full-width"
          onClick={handleAddToCart}
          disabled={adding || outOfStock}
        >
          {message || (outOfStock ? "Unavailable" : adding ? "Adding..." : "Add to Cart")}
        </button>
      </div>
    </div>
  );
}
