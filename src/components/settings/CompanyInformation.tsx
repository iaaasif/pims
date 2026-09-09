import { useState, useEffect, type ChangeEvent, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AlertCircle, Loader2, Save, Upload, Image as ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanyInformation, type CompanyInformation } from '@/hooks/useCompanyInformation';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';



// Form validation schema
const companySchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().or(z.literal('')),
  website: z.string().url().or(z.literal('')),
  tax_id: z.string().optional(),
  vat_number: z.string().optional(),
  site_title: z.string().min(1, 'Software name is required'),
});

type CompanyFormData = z.infer<typeof companySchema>;


export function CompanyInformationPanel() {
  const { isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    company,
    loading,
    error,
    saveCompany,
    uploadLogo
  } = useCompanyInformation({ enabled: isAdmin });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Company form
  const {
    register: registerCompany,
    handleSubmit: handleCompanySubmit,
    reset: resetCompany,
    formState: { errors: companyErrors, isSubmitting: isSavingCompany }
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      phone: '',
      email: '',
      website: '',
      tax_id: '',
      vat_number: '',
      site_title: 'PIMS',
    }
  });

  // Reset forms when data is loaded
  useEffect(() => {
    if (company) {
      resetCompany(company);
      setLogoPreview(company.logo_url || null);
    }
  }, [company, resetCompany]);

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to access this page. Only administrators can manage company information.
        </AlertDescription>
      </Alert>
    );
  }

  const handleCompanyFormSubmit = async (data: CompanyFormData) => {
    if (!company) return;

    const companyData: Partial<CompanyInformation> = {
      ...company,
      ...data
    };

    await saveCompany(companyData as CompanyInformation);
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    try {
      setIsUploading(true);
      const result = await uploadLogo(file);
      if (result.success) {
        toast.success('Logo uploaded successfully');
      } else {
        console.error('Upload failed:', result.error);
        toast.error(`Failed to upload logo: ${result.error instanceof Error ? result.error.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading && !company) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="Loading company profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
              <p className="text-muted-foreground">
                Manage your company details
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Logo</CardTitle>
                <CardDescription>
                  Upload your company logo to be displayed on printouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-32 border rounded-md overflow-hidden bg-muted/50 flex items-center justify-center">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Company Logo"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Button
                        variant="outline"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        {logoPreview ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                      <Input
                        id="logo-upload"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recommended size: 300x100px (transparent PNG for best results)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Update your company details that will be used in documents and invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCompanySubmit(handleCompanyFormSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name *</Label>
                      <Input
                        id="company_name"
                        {...registerCompany('company_name')}
                        placeholder="Acme Inc."
                      />
                      {companyErrors.company_name && (
                        <p className="text-sm text-destructive">{companyErrors.company_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...registerCompany('email')}
                        placeholder="contact@company.com"
                      />
                      {companyErrors.email && (
                        <p className="text-sm text-destructive">{companyErrors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        {...registerCompany('phone')}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        {...registerCompany('website')}
                        placeholder="https://example.com"
                      />
                      {companyErrors.website && (
                        <p className="text-sm text-destructive">{companyErrors.website.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        {...registerCompany('address')}
                        placeholder="123 Business St"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...registerCompany('city')}
                        placeholder="New York"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        {...registerCompany('state')}
                        placeholder="NY"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input
                        id="postal_code"
                        {...registerCompany('postal_code')}
                        placeholder="10001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        {...registerCompany('country')}
                        placeholder="United States"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tax_id">Tax ID</Label>
                      <Input
                        id="tax_id"
                        {...registerCompany('tax_id')}
                        placeholder="XX-XXXXXXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vat_number">VAT Number</Label>
                      <Input
                        id="vat_number"
                        {...registerCompany('vat_number')}
                        placeholder="XX-XXXXXXX"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="site_title">Software Name (Site Title)</Label>
                      <Input
                        id="site_title"
                        {...registerCompany('site_title')}
                        placeholder="e.g. PIMS"
                      />
                      <p className="text-[10px] text-muted-foreground">This name appears in the sidebar and browser tab.</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSavingCompany}>
                      {isSavingCompany ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

        </div>
    </div>
  );
}
