import Joi from 'joi';

export const createMedicineSchema = Joi.object({
  name: Joi.string().required().min(2).max(255).messages({
    'string.empty': 'Medicine name is required',
    'string.min': 'Medicine name must be at least 2 characters',
    'any.required': 'Medicine name is required'
  }),
  sanskrit_name: Joi.string().allow(null, '').max(255),
  category: Joi.string().required().messages({
    'string.empty': 'Category is required',
    'any.required': 'Category is required'
  }),
  manufacturer: Joi.string().allow(null, '').max(255),
  batch_number: Joi.string().allow(null, '').max(100),
  manufacturing_date: Joi.date().allow(null),
  expiry_date: Joi.date().allow(null).greater(Joi.ref('manufacturing_date')).messages({
    'date.greater': 'Expiry date must be after manufacturing date'
  }),
  quantity_stock: Joi.number().integer().min(0).default(0),
  unit: Joi.string().default('units').max(50),
  minimum_stock_level: Joi.number().integer().min(0).default(10),
  price_per_unit: Joi.number().min(0).default(0),
  description: Joi.string().allow(null, ''),
  storage_instructions: Joi.string().allow(null, '')
});

export const updateMedicineSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  sanskrit_name: Joi.string().allow(null, '').max(255),
  category: Joi.string(),
  manufacturer: Joi.string().allow(null, '').max(255),
  batch_number: Joi.string().allow(null, '').max(100),
  manufacturing_date: Joi.date().allow(null),
  expiry_date: Joi.date().allow(null),
  unit: Joi.string().max(50),
  minimum_stock_level: Joi.number().integer().min(0),
  price_per_unit: Joi.number().min(0),
  description: Joi.string().allow(null, ''),
  storage_instructions: Joi.string().allow(null, ''),
  is_active: Joi.boolean()
}).min(1);

export const updateStockSchema = Joi.object({
  type: Joi.string().valid('in', 'out', 'adjustment').required().messages({
    'any.only': 'Type must be one of: in, out, adjustment',
    'any.required': 'Stock movement type is required'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required'
  }),
  reason: Joi.string().required().messages({
    'string.empty': 'Reason for stock movement is required',
    'any.required': 'Reason for stock movement is required'
  }),
  notes: Joi.string().allow(null, '')
});

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    req.body = value;
    next();
  };
};
