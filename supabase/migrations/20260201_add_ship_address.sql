-- Add ship address fields to company_information table
ALTER TABLE public.company_information 
ADD COLUMN ship_to_name TEXT,
ADD COLUMN ship_to_address TEXT,
ADD COLUMN ship_to_title TEXT DEFAULT 'Site Inventory Manager',
ADD COLUMN ship_to_phone TEXT,
ADD COLUMN ship_to_email TEXT;

-- Insert default ship address data
UPDATE public.company_information 
SET 
    ship_to_name = 'Landora Surjodoy',
    ship_to_address = 'Block B, Bashundhara R/A, Dhaka 1229',
    ship_to_title = 'Site Inventory Manager'
WHERE ship_to_name IS NULL;
