import { ValidationError, BusinessError } from '../errors/index.js';

export class Invoice {
  constructor(data) {
    this.id = data.id;
    this.clinicId = data.clinic_id;
    this.invoiceNumber = data.invoice_number;
    this.patientId = data.patient_id;
    this.patientName = data.patient_name;
    this.patientPhone = data.patient_phone;
    this.invoiceDate = data.invoice_date;
    this.dueDate = data.due_date;
    this.status = data.status || 'pending';
    this.totalAmount = data.total_amount || 0;
    this.paidAmount = data.paid_amount || 0;
    this.discountAmount = data.discount_amount || 0;
    this.taxAmount = data.tax_amount || 0;
    this.notes = data.notes;
    this.items = data.items || [];
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    
    this.validate();
  }
  
  validate() {
    if (!this.invoiceNumber) {
      throw new ValidationError('Invoice number is required');
    }
    
    if (!this.patientId) {
      throw new ValidationError('Patient ID is required');
    }
    
    if (!this.invoiceDate) {
      throw new ValidationError('Invoice date is required');
    }
    
    const validStatuses = ['pending', 'paid', 'partial', 'overdue', 'cancelled'];
    if (this.status && !validStatuses.includes(this.status)) {
      throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
    }
    
    if (this.totalAmount < 0) {
      throw new ValidationError('Total amount cannot be negative');
    }
    
    if (this.paidAmount < 0) {
      throw new ValidationError('Paid amount cannot be negative');
    }
    
    if (this.paidAmount > this.totalAmount) {
      throw new ValidationError('Paid amount cannot exceed total amount');
    }
  }
  
  // Domain methods
  isPaid() {
    return this.status === 'paid' && this.paidAmount === this.totalAmount;
  }
  
  isPartiallyPaid() {
    return this.paidAmount > 0 && this.paidAmount < this.totalAmount;
  }
  
  isPending() {
    return this.status === 'pending' && this.paidAmount === 0;
  }
  
  isOverdue() {
    if (!this.dueDate) return false;
    return new Date(this.dueDate) < new Date() && !this.isPaid();
  }
  
  getRemainingAmount() {
    return this.totalAmount - this.paidAmount;
  }
  
  getPaymentPercentage() {
    if (this.totalAmount === 0) return 0;
    return Math.round((this.paidAmount / this.totalAmount) * 100);
  }
  
  canBePaid() {
    return !this.isPaid() && this.status !== 'cancelled';
  }
  
  canBeCancelled() {
    return this.status !== 'paid' && this.status !== 'cancelled';
  }
  
  getNetAmount() {
    return this.totalAmount - this.discountAmount;
  }
  
  getGrandTotal() {
    return this.getNetAmount() + this.taxAmount;
  }
  
  addPayment(amount) {
    if (amount <= 0) {
      throw new BusinessError('Payment amount must be positive');
    }
    
    if (this.paidAmount + amount > this.totalAmount) {
      throw new BusinessError('Payment exceeds invoice total');
    }
    
    this.paidAmount += amount;
    
    // Update status
    if (this.paidAmount === this.totalAmount) {
      this.status = 'paid';
    } else if (this.paidAmount > 0) {
      this.status = 'partial';
    }
  }
  
  // Convert to database format
  toDatabase() {
    return {
      clinic_id: this.clinicId,
      invoice_number: this.invoiceNumber,
      patient_id: this.patientId,
      invoice_date: this.invoiceDate,
      due_date: this.dueDate,
      status: this.status,
      total_amount: this.totalAmount,
      paid_amount: this.paidAmount,
      discount_amount: this.discountAmount,
      tax_amount: this.taxAmount,
      notes: this.notes
    };
  }
  
  // Convert to API response format (snake_case for frontend compatibility)
  toJSON() {
    return {
      id: this.id,
      invoice_number: this.invoiceNumber,
      patient_id: this.patientId,
      patient_name: this.patientName,
      patient_phone: this.patientPhone,
      invoice_date: this.invoiceDate,
      due_date: this.dueDate,
      status: this.status,
      total_amount: this.totalAmount,
      paid_amount: this.paidAmount,
      discount_amount: this.discountAmount,
      tax_amount: this.taxAmount,
      remaining_amount: this.getRemainingAmount(),
      payment_percentage: this.getPaymentPercentage(),
      net_amount: this.getNetAmount(),
      grand_total: this.getGrandTotal(),
      is_paid: this.isPaid(),
      is_partially_paid: this.isPartiallyPaid(),
      is_overdue: this.isOverdue(),
      can_be_paid: this.canBePaid(),
      notes: this.notes,
      items: this.items,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}
