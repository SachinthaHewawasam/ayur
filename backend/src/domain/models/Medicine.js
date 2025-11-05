import { ValidationError, BusinessError } from '../errors/index.js';

export class Medicine {
  constructor(data) {
    this.id = data.id;
    this.clinicId = data.clinic_id;
    this.name = data.name;
    this.sanskritName = data.sanskrit_name;
    this.category = data.category;
    this.manufacturer = data.manufacturer;
    this.batchNumber = data.batch_number;
    this.manufacturingDate = data.manufacturing_date;
    this.expiryDate = data.expiry_date;
    this.quantityStock = data.quantity_stock || 0;
    this.unit = data.unit || 'units';
    this.minimumStockLevel = data.minimum_stock_level || 10;
    this.pricePerUnit = data.price_per_unit || 0;
    this.description = data.description;
    this.storageInstructions = data.storage_instructions;
    this.isActive = data.is_active !== false;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    
    this.validate();
  }
  
  validate() {
    if (!this.name || this.name.trim().length < 2) {
      throw new ValidationError('Medicine name is required');
    }
    
    if (this.quantityStock < 0) {
      throw new ValidationError('Stock quantity cannot be negative');
    }
    
    if (this.pricePerUnit < 0) {
      throw new ValidationError('Price cannot be negative');
    }
    
    if (this.minimumStockLevel < 0) {
      throw new ValidationError('Minimum stock level cannot be negative');
    }
    
    if (this.expiryDate && this.manufacturingDate) {
      if (new Date(this.expiryDate) < new Date(this.manufacturingDate)) {
        throw new ValidationError('Expiry date must be after manufacturing date');
      }
    }
  }
  
  // Domain methods
  isLowStock() {
    return this.quantityStock <= this.minimumStockLevel;
  }
  
  isOutOfStock() {
    return this.quantityStock === 0;
  }
  
  isExpired() {
    if (!this.expiryDate) return false;
    return new Date(this.expiryDate) < new Date();
  }
  
  isExpiringSoon(days = 30) {
    if (!this.expiryDate) return false;
    const expiryDate = new Date(this.expiryDate);
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + days);
    return expiryDate <= warningDate && expiryDate >= new Date();
  }
  
  getExpiryStatus() {
    if (this.isExpired()) return 'expired';
    if (this.isExpiringSoon()) return 'expiring_soon';
    return 'valid';
  }
  
  getStockStatus() {
    if (this.isOutOfStock()) return 'out_of_stock';
    if (this.isLowStock()) return 'low_stock';
    return 'in_stock';
  }
  
  canFulfillOrder(quantity) {
    return this.quantityStock >= quantity;
  }
  
  calculateTotalValue() {
    return this.quantityStock * this.pricePerUnit;
  }
  
  addStock(quantity) {
    if (quantity <= 0) {
      throw new BusinessError('Quantity must be positive');
    }
    this.quantityStock += quantity;
  }
  
  removeStock(quantity) {
    if (quantity <= 0) {
      throw new BusinessError('Quantity must be positive');
    }
    if (!this.canFulfillOrder(quantity)) {
      throw new BusinessError(
        `Insufficient stock. Available: ${this.quantityStock}, Requested: ${quantity}`
      );
    }
    this.quantityStock -= quantity;
  }
  
  // Convert to database format
  toDatabase() {
    return {
      clinic_id: this.clinicId,
      name: this.name,
      sanskrit_name: this.sanskritName,
      category: this.category,
      manufacturer: this.manufacturer,
      batch_number: this.batchNumber,
      manufacturing_date: this.manufacturingDate,
      expiry_date: this.expiryDate,
      quantity_stock: this.quantityStock,
      unit: this.unit,
      minimum_stock_level: this.minimumStockLevel,
      price_per_unit: this.pricePerUnit,
      description: this.description,
      storage_instructions: this.storageInstructions,
      is_active: this.isActive
    };
  }
  
  // Convert to API response format (snake_case for frontend compatibility)
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      sanskrit_name: this.sanskritName,
      category: this.category,
      manufacturer: this.manufacturer,
      batch_number: this.batchNumber,
      manufacturing_date: this.manufacturingDate,
      expiry_date: this.expiryDate,
      quantity_stock: this.quantityStock,
      unit: this.unit,
      minimum_stock_level: this.minimumStockLevel,
      price_per_unit: this.pricePerUnit,
      description: this.description,
      storage_instructions: this.storageInstructions,
      stock_status: this.getStockStatus(),
      expiry_status: this.getExpiryStatus(),
      is_low_stock: this.isLowStock(),
      is_expired: this.isExpired(),
      total_value: this.calculateTotalValue(),
      is_active: this.isActive,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}
