import React, { useEffect, useState } from "react";
import { productApi, categoryApi } from "../api/productApi";
import { orderApi } from "../api/orderApi";

const emptyProductForm = { id: null, name: "", description: "", price: "", stockQuantity: "", imageUrl: "", categoryId: "" };

export default function AdminPage() {
  const [tab, setTab] = useState("products");

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      <div className="admin-tabs">
        <button className={tab === "products" ? "chip chip-active" : "chip"} onClick={() => setTab("products")}>Products</button>
        <button className={tab === "categories" ? "chip chip-active" : "chip"} onClick={() => setTab("categories")}>Categories</button>
        <button className={tab === "orders" ? "chip chip-active" : "chip"} onClick={() => setTab("orders")}>Orders</button>
      </div>

      {tab === "products" && <ProductsAdmin />}
      {tab === "categories" && <CategoriesAdmin />}
      {tab === "orders" && <OrdersAdmin />}
    </div>
  );
}

function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProductForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadProducts = () => {
    productApi.getProducts({ page: 0, size: 50 }).then(({ data }) => setProducts(data.content));
  };

  useEffect(() => {
    loadProducts();
    categoryApi.getCategories().then(({ data }) => setCategories(data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl || "",
      categoryId: product.category ? product.category.id : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
      imageUrl: form.imageUrl,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    };
    try {
      if (form.id) {
        await productApi.updateProduct(form.id, payload);
      } else {
        await productApi.createProduct(payload);
      }
      setForm(emptyProductForm);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this product?")) return;
    await productApi.deleteProduct(id);
    loadProducts();
  };

  return (
    <div className="admin-section">
      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{form.id ? "Edit Product" : "New Product"}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <label>Name</label>
        <input name="name" required value={form.name} onChange={handleChange} />
        <label>Description</label>
        <textarea name="description" rows={3} value={form.description} onChange={handleChange} />
        <div className="form-row">
          <div>
            <label>Price</label>
            <input name="price" type="number" step="0.01" min="0" required value={form.price} onChange={handleChange} />
          </div>
          <div>
            <label>Stock Quantity</label>
            <input name="stockQuantity" type="number" min="0" required value={form.stockQuantity} onChange={handleChange} />
          </div>
        </div>
        <label>Image URL</label>
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
        <label>Category</label>
        <select name="categoryId" value={form.categoryId} onChange={handleChange}>
          <option value="">-- None --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="form-row">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : form.id ? "Update Product" : "Create Product"}
          </button>
          {form.id && (
            <button type="button" className="btn-link" onClick={() => setForm(emptyProductForm)}>Cancel</button>
          )}
        </div>
      </form>

      <table className="admin-table">
        <thead>
          <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.category ? p.category.name : "—"}</td>
              <td>${Number(p.price).toFixed(2)}</td>
              <td>{p.stockQuantity}</td>
              <td>
                <button className="btn-link" onClick={() => handleEdit(p)}>Edit</button>
                <button className="btn-link btn-danger" onClick={() => handleDelete(p.id)}>Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ id: null, name: "", description: "" });
  const [error, setError] = useState("");

  const loadCategories = () => categoryApi.getCategories().then(({ data }) => setCategories(data));

  useEffect(() => { loadCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (form.id) {
        await categoryApi.updateCategory(form.id, { name: form.name, description: form.description });
      } else {
        await categoryApi.createCategory({ name: form.name, description: form.description });
      }
      setForm({ id: null, name: "", description: "" });
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save category");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await categoryApi.deleteCategory(id);
    loadCategories();
  };

  return (
    <div className="admin-section">
      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{form.id ? "Edit Category" : "New Category"}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <label>Name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label>Description</label>
        <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit" className="btn-primary">{form.id ? "Update" : "Create"}</button>
      </form>

      <table className="admin-table">
        <thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.description}</td>
              <td>
                <button className="btn-link" onClick={() => setForm(c)}>Edit</button>
                <button className="btn-link btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

  const loadOrders = () => orderApi.getAllOrders({ page: 0, size: 50 }).then(({ data }) => setOrders(data.content));

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (id, status) => {
    await orderApi.updateOrderStatus(id, status);
    loadOrders();
  };

  return (
    <div className="admin-section">
      <table className="admin-table">
        <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.shippingAddress}</td>
              <td>${Number(o.totalAmount).toFixed(2)}</td>
              <td>
                <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
