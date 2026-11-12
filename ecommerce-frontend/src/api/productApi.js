import apiClient from "./apiClient";

export const productApi = {
  getProducts: (params) => apiClient.get("/products", { params }),
  getProductById: (id) => apiClient.get(`/products/${id}`),
  createProduct: (data) => apiClient.post("/products", data),
  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),
};

export const categoryApi = {
  getCategories: () => apiClient.get("/categories"),
  createCategory: (data) => apiClient.post("/categories", data),
  updateCategory: (id, data) => apiClient.put(`/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`),
};
