import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface CompanyInformation {
  id?: string;
  company_name: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  tax_id?: string;
  vat_number?: string;
  site_title?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PrintSettings {
  id?: string;
  company_id: string;
  header_margin_top: number;
  header_margin_side: number;
  footer_margin_bottom: number;
  footer_margin_side: number;
  page_margin_top: number;
  page_margin_right: number;
  page_margin_bottom: number;
  page_margin_left: number;
  created_at?: string;
  updated_at?: string;
}

export interface UseCompanyInformationOptions {
  enabled?: boolean;
}

export function useCompanyInformation(options: UseCompanyInformationOptions = {}) {
  const { enabled = true } = options;
  const [company, setCompany] = useState<CompanyInformation | null>(null);
  const [printSettings, setPrintSettings] = useState<PrintSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch company information
  const fetchCompany = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('company_information')
        .select('*')
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        setCompany(data);
        await fetchPrintSettings(data.id);
      } else {
        // Initialize with empty company if none exists
        setCompany({
          company_name: 'Your Company Name',
          address: '',
          city: '',
          state: '',
          postal_code: '',
          country: '',
          phone: '',
          email: '',
          website: '',
          logo_url: '',
          tax_id: '',
          vat_number: '',
          site_title: 'PIMS'
        });
      }
    } catch (err) {
      console.error('Error fetching company information:', err);
      setError('Failed to load company information');
    } finally {
      setLoading(false);
    }
  };

  // Fetch print settings
  const fetchPrintSettings = async (companyId: string) => {
    try {
      const { data, error: settingsError } = await supabase
        .from('print_settings')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (settingsError) throw settingsError;

      if (data) {
        setPrintSettings(data);
      } else {
        // Default print settings
        setPrintSettings({
          company_id: companyId,
          header_margin_top: 10,
          header_margin_side: 15,
          footer_margin_bottom: 10,
          footer_margin_side: 15,
          page_margin_top: 20,
          page_margin_right: 15,
          page_margin_bottom: 20,
          page_margin_left: 15,
        });
      }
    } catch (err) {
      console.error('Error fetching print settings:', err);
      setError('Failed to load print settings');
    }
  };

  // Save company information
  const saveCompany = async (companyData: CompanyInformation) => {
    try {
      setLoading(true);

      if (companyData.id) {
        // Update existing company
        const { data, error: updateError } = await supabase
          .from('company_information')
          .update(companyData)
          .eq('id', companyData.id)
          .select()
          .single();

        if (updateError) throw updateError;
        setCompany(data);
      } else {
        // Create new company
        const { data, error: createError } = await supabase
          .from('company_information')
          .insert([companyData])
          .select()
          .single();

        if (createError) throw createError;
        setCompany(data);
      }

      toast.success('Company information saved successfully');
      return { success: true };
    } catch (err) {
      console.error('Error saving company information:', err);
      toast.error('Failed to save company information');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Save print settings
  const savePrintSettings = async (settings: PrintSettings) => {
    try {
      setLoading(true);

      if (settings.id) {
        // Update existing settings
        const { data, error: updateError } = await supabase
          .from('print_settings')
          .update(settings)
          .eq('id', settings.id)
          .select()
          .single();

        if (updateError) throw updateError;
        setPrintSettings(data);
      } else if (settings.company_id) {
        // Create new settings
        const { data, error: createError } = await supabase
          .from('print_settings')
          .insert([settings])
          .select()
          .single();

        if (createError) throw createError;
        setPrintSettings(data);
      }

      toast.success('Print settings saved successfully');
      return { success: true };
    } catch (err) {
      console.error('Error saving print settings:', err);
      toast.error('Failed to save print settings');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Upload company logo
  const uploadLogo = async (file: File) => {
    try {
      if (!company) throw new Error('No company information available');

      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);

      // Update company with new logo URL
      const saveResult = await saveCompany({
        ...company,
        logo_url: publicUrl
      });

      if (!saveResult.success) {
        return { success: false, error: saveResult.error };
      }

      return { success: true, url: publicUrl };
    } catch (err) {
      console.error('Error uploading logo:', err);
      return { success: false, error: err };
    }
  };

  // Load data on mount
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    fetchCompany();
  }, [enabled]);

  return {
    company,
    printSettings,
    loading,
    error,
    saveCompany,
    savePrintSettings,
    uploadLogo,
    refresh: fetchCompany
  };
}
