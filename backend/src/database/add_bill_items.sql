-- Create bill_items table to track individual items in invoices
CREATE TABLE IF NOT EXISTS bill_items (
    id SERIAL PRIMARY KEY,
    bill_id INT REFERENCES bills(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'medicine', 'consultation', 'treatment', 'other'
    medicine_id INT REFERENCES medicines(id) ON DELETE SET NULL, -- NULL for non-medicine items
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit VARCHAR(50), -- 'units', 'tablets', 'bottles', etc.
    price_per_unit DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    tax_percentage DECIMAL(5, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for bill items
CREATE INDEX IF NOT EXISTS idx_bill_items_bill ON bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_items_medicine ON bill_items(medicine_id);

-- Add additional fields to bills table if they don't exist
ALTER TABLE bills ADD COLUMN IF NOT EXISTS invoice_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255); -- For non-patient buyers
ALTER TABLE bills ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS customer_gstin VARCHAR(50); -- For GST customers
ALTER TABLE bills ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(50) DEFAULT 'patient'; -- 'patient', 'retail', 'wholesale'

COMMENT ON TABLE bill_items IS 'Stores individual line items for each invoice/bill';
