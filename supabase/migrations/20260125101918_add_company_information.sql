-- Create company_information table
CREATE TABLE IF NOT EXISTS public.company_information (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    tax_id TEXT,
    vat_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.company_information ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.company_information
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for admins" ON public.company_information
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

CREATE POLICY "Enable update for admins" ON public.company_information
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- Create print_settings table
CREATE TABLE IF NOT EXISTS public.print_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.company_information(id) ON DELETE CASCADE,
    header_margin_top FLOAT DEFAULT 10.0,
    header_margin_side FLOAT DEFAULT 15.0,
    footer_margin_bottom FLOAT DEFAULT 10.0,
    footer_margin_side FLOAT DEFAULT 15.0,
    page_margin_top FLOAT DEFAULT 20.0,
    page_margin_right FLOAT DEFAULT 15.0,
    page_margin_bottom FLOAT DEFAULT 20.0,
    page_margin_left FLOAT DEFAULT 15.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_company_print_settings UNIQUE (company_id)
);

-- Enable RLS for print_settings
ALTER TABLE public.print_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for print_settings
CREATE POLICY "Enable read access for all users" ON public.print_settings
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for admins" ON public.print_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

CREATE POLICY "Enable update for admins" ON public.print_settings
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW; 
END;
$$ language 'plpgsql';

-- Create triggers to update timestamps
CREATE TRIGGER update_company_information_modtime
    BEFORE UPDATE ON public.company_information
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_print_settings_modtime
    BEFORE UPDATE ON public.print_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Insert default print settings function
CREATE OR REPLACE FUNCTION create_default_print_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.print_settings (company_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to add default print settings when a new company is created
CREATE TRIGGER after_company_created
    AFTER INSERT ON public.company_information
    FOR EACH ROW
    EXECUTE FUNCTION create_default_print_settings();