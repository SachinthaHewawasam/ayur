import { InvoiceRepository } from '../../infrastructure/repositories/InvoiceRepository.js';
import { PatientRepository } from '../../infrastructure/repositories/PatientRepository.js';
import { Invoice } from '../../domain/models/Invoice.js';
import { BusinessError, NotFoundError } from '../../domain/errors/index.js';

export class InvoiceService {
  constructor() {
    this.invoiceRepo = new InvoiceRepository();
    this.patientRepo = new PatientRepository();
  }
  
  /**
   * Get all invoices with filters
   */
  async getAllInvoices(clinicId, filters = {}) {
    const invoices = await this.invoiceRepo.findAllByClinic(clinicId, filters);
    return invoices.map(i => i.toJSON());
  }
  
  /**
   * Get invoice by ID
   */
  async getInvoice(id, clinicId) {
    const invoice = await this.invoiceRepo.findById(id, clinicId);
    
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }
    
    return invoice.toJSON();
  }
  
  /**
   * Create new invoice
   */
  async createInvoice(clinicId, data) {
    // Verify patient exists
    const patient = await this.patientRepo.findById(data.patient_id, clinicId);
    
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }
    
    // Generate invoice number
    const invoiceNumber = await this.invoiceRepo.generateInvoiceNumber(clinicId);
    
    // Create invoice model
    const invoice = new Invoice({
      ...data,
      clinic_id: clinicId,
      invoice_number: invoiceNumber,
      status: 'pending'
    });
    
    const savedInvoice = await this.invoiceRepo.create(invoice);
    
    return savedInvoice.toJSON();
  }
  
  /**
   * Update invoice
   */
  async updateInvoice(id, clinicId, data) {
    const invoice = await this.invoiceRepo.findById(id, clinicId);
    
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }
    
    // Update properties
    Object.assign(invoice, {
      status: data.status || invoice.status,
      totalAmount: data.total_amount !== undefined ? data.total_amount : invoice.totalAmount,
      discountAmount: data.discount_amount !== undefined ? data.discount_amount : invoice.discountAmount,
      taxAmount: data.tax_amount !== undefined ? data.tax_amount : invoice.taxAmount,
      dueDate: data.due_date !== undefined ? data.due_date : invoice.dueDate,
      notes: data.notes !== undefined ? data.notes : invoice.notes
    });
    
    // Validate updated invoice
    invoice.validate();
    
    const updatedInvoice = await this.invoiceRepo.update(invoice);
    
    return updatedInvoice.toJSON();
  }
  
  /**
   * Record payment
   */
  async recordPayment(id, clinicId, { amount, payment_method, notes }) {
    const invoice = await this.invoiceRepo.findById(id, clinicId);
    
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }
    
    if (!invoice.canBePaid()) {
      throw new BusinessError('This invoice cannot be paid');
    }
    
    if (amount <= 0) {
      throw new BusinessError('Payment amount must be positive');
    }
    
    if (amount > invoice.getRemainingAmount()) {
      throw new BusinessError(
        `Payment exceeds remaining amount of ${invoice.getRemainingAmount()}`
      );
    }
    
    const updatedInvoice = await this.invoiceRepo.recordPayment(
      id,
      amount,
      payment_method,
      notes
    );
    
    return updatedInvoice.toJSON();
  }
  
  /**
   * Cancel invoice
   */
  async cancelInvoice(id, clinicId) {
    const invoice = await this.invoiceRepo.findById(id, clinicId);
    
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }
    
    if (!invoice.canBeCancelled()) {
      throw new BusinessError('This invoice cannot be cancelled');
    }
    
    invoice.status = 'cancelled';
    const updatedInvoice = await this.invoiceRepo.update(invoice);
    
    return updatedInvoice.toJSON();
  }
  
  /**
   * Get invoice statistics
   */
  async getInvoiceStats(clinicId, startDate, endDate) {
    const stats = await this.invoiceRepo.getInvoiceStats(clinicId, startDate, endDate);
    
    return {
      total_invoices: parseInt(stats.total_invoices) || 0,
      total_amount: parseFloat(stats.total_amount) || 0,
      total_paid: parseFloat(stats.total_paid) || 0,
      paid_count: parseInt(stats.paid_count) || 0,
      partial_count: parseInt(stats.partial_count) || 0,
      pending_count: parseInt(stats.pending_count) || 0,
      overdue_count: parseInt(stats.overdue_count) || 0,
      collection_rate: stats.total_amount > 0 
        ? Math.round((parseFloat(stats.total_paid) / parseFloat(stats.total_amount)) * 100)
        : 0
    };
  }
  
  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(clinicId) {
    const invoices = await this.invoiceRepo.getOverdueInvoices(clinicId);
    return invoices.map(i => i.toJSON());
  }
}
