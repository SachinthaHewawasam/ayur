import { MedicineRepository } from '../../infrastructure/repositories/MedicineRepository.js';
import { Medicine } from '../../domain/models/Medicine.js';
import { BusinessError, NotFoundError } from '../../domain/errors/index.js';
import { pool } from '../../config/database.js';

export class MedicineService {
  constructor() {
    this.medicineRepo = new MedicineRepository();
  }
  
  /**
   * Get all medicines with filters
   */
  async getAllMedicines(filters = {}) {
    const medicines = await this.medicineRepo.findAll({
      search: filters.search,
      category: filters.category,
      lowStock: filters.low_stock === 'true',
      activeOnly: filters.active_only !== 'false'
    });
    
    return medicines.map(m => m.toJSON());
  }
  
  /**
   * Get medicine by ID with stock history
   */
  async getMedicineById(id) {
    const medicine = await this.medicineRepo.findById(id);
    
    if (!medicine) {
      throw new NotFoundError('Medicine not found');
    }
    
    const stockMovements = await this.medicineRepo.getStockMovements(id, 50);
    
    return {
      ...medicine.toJSON(),
      stockMovements
    };
  }
  
  /**
   * Create new medicine
   */
  async createMedicine(clinicId, userId, data) {
    // Create medicine model (validates automatically)
    const medicine = new Medicine({
      ...data,
      clinic_id: clinicId
    });
    
    // Save medicine
    const savedMedicine = await this.medicineRepo.create(medicine);
    
    // Record initial stock if provided
    if (data.quantity_stock && data.quantity_stock > 0) {
      await this.recordStockMovement({
        medicine_id: savedMedicine.id,
        type: 'in',
        quantity: data.quantity_stock,
        reason: 'Initial stock',
        performed_by: userId
      });
    }
    
    return savedMedicine.toJSON();
  }
  
  /**
   * Update medicine
   */
  async updateMedicine(id, data) {
    const medicine = await this.medicineRepo.findById(id);
    
    if (!medicine) {
      throw new NotFoundError('Medicine not found');
    }
    
    // Update properties (excluding quantity_stock - use updateStock for that)
    Object.assign(medicine, {
      name: data.name || medicine.name,
      sanskritName: data.sanskrit_name !== undefined ? data.sanskrit_name : medicine.sanskritName,
      category: data.category || medicine.category,
      manufacturer: data.manufacturer !== undefined ? data.manufacturer : medicine.manufacturer,
      batchNumber: data.batch_number !== undefined ? data.batch_number : medicine.batchNumber,
      manufacturingDate: data.manufacturing_date !== undefined ? data.manufacturing_date : medicine.manufacturingDate,
      expiryDate: data.expiry_date !== undefined ? data.expiry_date : medicine.expiryDate,
      unit: data.unit || medicine.unit,
      minimumStockLevel: data.minimum_stock_level !== undefined ? data.minimum_stock_level : medicine.minimumStockLevel,
      pricePerUnit: data.price_per_unit !== undefined ? data.price_per_unit : medicine.pricePerUnit,
      description: data.description !== undefined ? data.description : medicine.description,
      storageInstructions: data.storage_instructions !== undefined ? data.storage_instructions : medicine.storageInstructions,
      isActive: data.is_active !== undefined ? data.is_active : medicine.isActive
    });
    
    // Validate updated medicine
    medicine.validate();
    
    // Save to database
    const updatedMedicine = await this.medicineRepo.update(medicine);
    
    return updatedMedicine.toJSON();
  }
  
  /**
   * Update medicine stock
   */
  async updateStock(medicineId, userId, { type, quantity, reason, notes }) {
    // Validate type
    if (!['in', 'out', 'adjustment'].includes(type)) {
      throw new BusinessError('Invalid stock movement type. Must be: in, out, or adjustment');
    }
    
    // Get medicine
    const medicine = await this.medicineRepo.findById(medicineId);
    
    if (!medicine) {
      throw new NotFoundError('Medicine not found');
    }
    
    const previousStock = medicine.quantityStock;
    
    // Update stock based on type
    try {
      if (type === 'in') {
        medicine.addStock(quantity);
      } else if (type === 'out') {
        medicine.removeStock(quantity);
      } else if (type === 'adjustment') {
        if (quantity > 0) {
          medicine.addStock(quantity);
        } else {
          medicine.removeStock(Math.abs(quantity));
        }
      }
    } catch (error) {
      throw error; // Re-throw domain errors (BusinessError)
    }
    
    // Update medicine in database
    await this.medicineRepo.update(medicine);
    
    // Record stock movement
    const movement = await this.recordStockMovement({
      medicine_id: medicineId,
      type,
      quantity: Math.abs(quantity),
      reason: reason || 'Manual adjustment',
      notes,
      performed_by: userId
    });
    
    return {
      previousStock,
      newStock: medicine.quantityStock,
      movement
    };
  }
  
  /**
   * Get low stock alerts
   */
  async getLowStockAlerts() {
    const medicines = await this.medicineRepo.getLowStockMedicines();
    
    return medicines.map(m => ({
      ...m.toJSON(),
      shortageQuantity: m.minimumStockLevel - m.quantityStock,
      stockPercentage: Math.round((m.quantityStock / m.minimumStockLevel) * 100)
    }));
  }
  
  /**
   * Get expiring medicines
   */
  async getExpiringMedicines(days = 30) {
    const medicines = await this.medicineRepo.getExpiringMedicines(days);
    
    return medicines.map(m => {
      const daysUntilExpiry = Math.ceil(
        (new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        ...m.toJSON(),
        days_until_expiry: daysUntilExpiry
      };
    });
  }
  
  /**
   * Get inventory statistics
   */
  async getInventoryStats(clinicId) {
    const allMedicines = await this.medicineRepo.findAll({ 
      activeOnly: true 
    });
    
    // Filter by clinic if needed (assuming medicines table has clinic_id)
    const clinicMedicines = allMedicines.filter(m => m.clinicId === clinicId);
    
    const stats = {
      totalMedicines: clinicMedicines.length,
      lowStockCount: clinicMedicines.filter(m => m.isLowStock()).length,
      outOfStockCount: clinicMedicines.filter(m => m.isOutOfStock()).length,
      expiredCount: clinicMedicines.filter(m => m.isExpired()).length,
      expiringSoonCount: clinicMedicines.filter(m => m.isExpiringSoon()).length,
      totalInventoryValue: clinicMedicines.reduce((sum, m) => sum + m.calculateTotalValue(), 0)
    };
    
    // Get category breakdown
    const categories = {};
    clinicMedicines.forEach(m => {
      if (!categories[m.category]) {
        categories[m.category] = { count: 0, totalQuantity: 0 };
      }
      categories[m.category].count++;
      categories[m.category].totalQuantity += m.quantityStock;
    });
    
    return {
      ...stats,
      categories: Object.entries(categories).map(([name, data]) => ({
        category: name,
        ...data
      }))
    };
  }
  
  /**
   * Delete medicine (soft delete)
   */
  async deleteMedicine(id) {
    const medicine = await this.medicineRepo.findById(id);
    
    if (!medicine) {
      throw new NotFoundError('Medicine not found');
    }
    
    await this.medicineRepo.softDelete(id);
    
    return { message: 'Medicine deactivated successfully' };
  }
  
  /**
   * Record stock movement (private helper)
   */
  async recordStockMovement(data) {
    try {
      const query = `
        INSERT INTO stock_movements (
          medicine_id, type, quantity, reason, notes, performed_by
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const values = [
        data.medicine_id,
        data.type,
        data.quantity,
        data.reason,
        data.notes || null,
        data.performed_by
      ];
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new BusinessError(`Failed to record stock movement: ${error.message}`);
    }
  }
}
