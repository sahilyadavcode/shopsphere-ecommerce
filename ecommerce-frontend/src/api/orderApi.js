import apiClient from "./apiClient";

export const cartApi = {
  getCart: () => apiClient.get("/cart"),
  addItem: (data) => apiClient.post("/cart/items", data),
  updateItem: (itemId, quantity) => apiClient.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => apiClient.delete(`/cart/items/${itemId}`),
  clearCart: () => apiClient.delete("/cart"),
};

export const orderApi = {
  checkout: (data) => apiClient.post("/orders/checkout", data),
  getMyOrders: (params) => apiClient.get("/orders", { params }),
  getOrderById: (id) => apiClient.get(`/orders/${id}`),
  getAllOrders: (params) => apiClient.get("/orders/admin/all", { params }),
  updateOrderStatus: (id, status) => apiClient.patch(`/orders/admin/${id}/status`, null, { params: { status } }),
};
