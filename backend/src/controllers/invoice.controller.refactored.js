import { InvoiceService } from '../application/services/InvoiceService.js';

const invoiceService = new InvoiceService();

/**
 * Get all invoices
 * GET /api/invoices
 */
export const getAllInvoices = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic_id;
    const { status, patient_id, search, start_date, end_date } = req.query;
    
    const invoices = await invoiceService.getAllInvoices(clinicId, {
      status,
      patientId: patient_id,
      search,
      startDate: start_date,
      endDate: end_date
    });
    
    res.json({ invoices });
  } catch (error) {
    next(error);
  }
};

/**
 * Get invoice by ID
 * GET /api/invoices/:id
 */
export const getInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;
    
    const invoice = await invoiceService.getInvoice(id, clinicId);
    
    res.json({ invoice });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new invoice
 * POST /api/invoices
 */
export const createInvoice = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic_id;
    
    const invoice = await invoiceService.createInvoice(clinicId, req.body);
    
    res.status(201).json({
      message: 'Invoice created successfully',
      invoice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update invoice
 * PUT /api/invoices/:id
 */
export const updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;
    
    const invoice = await invoiceService.updateInvoice(id, clinicId, req.body);
    
    res.json({
      message: 'Invoice updated successfully',
      invoice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record payment
 * POST /api/invoices/:id/payment
 */
export const recordPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;
    
    const invoice = await invoiceService.recordPayment(id, clinicId, req.body);
    
    res.json({
      message: 'Payment recorded successfully',
      invoice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel invoice
 * PUT /api/invoices/:id/cancel
 */
export const cancelInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;
    
    const invoice = await invoiceService.cancelInvoice(id, clinicId);
    
    res.json({
      message: 'Invoice cancelled successfully',
      invoice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get invoice statistics
 * GET /api/invoices/stats
 */
export const getInvoiceStats = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic_id;
    const { start_date, end_date } = req.query;
    
    const stats = await invoiceService.getInvoiceStats(clinicId, start_date, end_date);
    
    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

/**
 * Get overdue invoices
 * GET /api/invoices/overdue
 */
export const getOverdueInvoices = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic_id;
    
    const invoices = await invoiceService.getOverdueInvoices(clinicId);
    
    res.json({ invoices });
  } catch (error) {
    next(error);
  }
};
