import { api } from './api';

export const productService = {
  // Get all products
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  // Create new product
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Create POS Invoice/Order
  createInvoice: async (invoiceData) => {
    const response = await api.post('/orders', invoiceData);
    return response.data;
  },
};