-- Create settings table for system configuration
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
  system_name VARCHAR(100) DEFAULT 'ACMS',
  clinic_name VARCHAR(255),
  clinic_address TEXT,
  clinic_phone VARCHAR(20),
  clinic_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(clinic_id)
);

-- Add specialization and phone to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_clinic_id ON settings(clinic_id);

-- Insert default settings for existing clinics
INSERT INTO settings (clinic_id, system_name)
SELECT id, 'ACMS' FROM clinics
WHERE id NOT IN (SELECT clinic_id FROM settings WHERE clinic_id IS NOT NULL)
ON CONFLICT (clinic_id) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();
