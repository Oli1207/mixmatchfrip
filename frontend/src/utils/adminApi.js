import apiInstance from './axios'

export const adminAPI = {
  stats: () => apiInstance.get('admin/stats/'),

  products: {
    list:        (search = '')  => apiInstance.get('admin/products/', { params: search ? { search } : {} }),
    get:         (id)           => apiInstance.get(`admin/products/${id}/`),
    create:      (data)         => apiInstance.post('admin/products/', data),
    update:      (id, data)     => apiInstance.put(`admin/products/${id}/`, data),
    delete:      (id)           => apiInstance.delete(`admin/products/${id}/`),
    uploadImage: (id, formData) => apiInstance.post(`admin/products/${id}/images/`, formData),
    deleteImage: (id, imageId)  => apiInstance.delete(`admin/products/${id}/images/${imageId}/`),
  },

  categories: {
    list:   ()           => apiInstance.get('admin/categories/'),
    create: (data)       => apiInstance.post('admin/categories/', data),
    update: (id, data)   => apiInstance.put(`admin/categories/${id}/`, data),
    delete: (id)         => apiInstance.delete(`admin/categories/${id}/`),
  },

  subcategories: {
    list:   ()           => apiInstance.get('admin/subcategories/'),
    create: (data)       => apiInstance.post('admin/subcategories/', data),
    update: (id, data)   => apiInstance.put(`admin/subcategories/${id}/`, data),
    delete: (id)         => apiInstance.delete(`admin/subcategories/${id}/`),
  },

  orders: {
    list:         (params = {}) => apiInstance.get('admin/orders/', { params }),
    updateStatus: (orderNumber, status) =>
      apiInstance.patch(`admin/orders/${orderNumber}/status/`, { status }),
  },

  promos: {
    list:   ()           => apiInstance.get('admin/promos/'),
    create: (data)       => apiInstance.post('admin/promos/', data),
    update: (id, data)   => apiInstance.patch(`admin/promos/${id}/`, data),
    delete: (id)         => apiInstance.delete(`admin/promos/${id}/`),
  },

  newsletter: {
    list:   ()    => apiInstance.get('admin/newsletter/'),
    delete: (id)  => apiInstance.delete(`admin/newsletter/${id}/`),
  },

  clients: {
    list: () => apiInstance.get('admin/clients/'),
  },

  analytics: {
    overview: (days = 30) => apiInstance.get('admin/analytics/', { params: { days } }),
  },
}
