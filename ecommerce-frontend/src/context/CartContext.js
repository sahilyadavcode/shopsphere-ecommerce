import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { cartApi } from "../api/orderApi";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], totalAmount: 0 });
      return;
    }
    setLoading(true);
    try {
      const { data } = await cartApi.getCart();
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await cartApi.addItem({ productId, quantity });
    setCart(data);
  };

  const updateQuantity = async (itemId, quantity) => {
    const { data } = await cartApi.updateItem(itemId, quantity);
    setCart(data);
  };

  const removeItem = async (itemId) => {
    const { data } = await cartApi.removeItem(itemId);
    setCart(data);
  };

  const clearCart = async () => {
    await cartApi.clearCart();
    setCart({ items: [], totalAmount: 0 });
  };

  const itemCount = cart.items ? cart.items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, itemCount, addToCart, updateQuantity, removeItem, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
