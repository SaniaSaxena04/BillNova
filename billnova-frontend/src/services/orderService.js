import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/api/v1/checkout', orderData);
    return response.data;
  },
};