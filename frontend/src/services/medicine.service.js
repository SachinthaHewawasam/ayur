import api from './api.service';

class MedicineService {
  async getAllMedicines(filters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });

    return api.get('/medicines', Object.fromEntries(params));
  }

  async getMedicineById(id) {
    return api.get(`/medicines/${id}`);
  }

  async createMedicine(medicineData) {
    return api.post('/medicines', medicineData);
  }

  async updateMedicine(id, medicineData) {
    return api.put(`/medicines/${id}`, medicineData);
  }

  async updateStock(id, stockData) {
    return api.patch(`/medicines/${id}/stock`, stockData);
  }

  async getLowStockAlerts() {
    return api.get('/medicines/alerts/low-stock');
  }

  async getExpiringMedicines(days = 30) {
    return api.get('/medicines/alerts/expiring', { days });
  }

  async getInventoryStats() {
    return api.get('/medicines/stats');
  }

  async deleteMedicine(id) {
    return api.delete(`/medicines/${id}`);
  }

  async searchMedicines(query) {
    return api.get('/medicines/search', { q: query });
  }

  async getMedicineCategories() {
    return api.get('/medicines/categories');
  }

  async getMedicineByBarcode(barcode) {
    return api.get(`/medicines/barcode/${barcode}`);
  }
}

export default new MedicineService();
