import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from '@/components/ui/label'
import { PremiumAvatar } from '@/components/ui/PremiumAvatar'
import {
    Camera,
    Loader2,
    Lock,
    User,
    Link as LinkIcon,
    Linkedin,
    Twitter,
    Globe,
    Briefcase,
    Mail,
    Phone
} from 'lucide-react'

const profileSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional().nullable(),
    avatar_url: z.string().optional().nullable(),
    bio: z.string().max(160, 'Bio must be less than 160 characters').optional().nullable(),
    job_title: z.string().optional().nullable(),
    linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
    twitter_url: z.string().url('Invalid URL').optional().or(z.literal('')),
    website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
})

const passwordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export function ProfileSettingsPanel() {
    const { profile, user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [passLoading, setPassLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: profile?.full_name || '',
            phone: profile?.phone || '',
            avatar_url: profile?.avatar_url || '',
            bio: (profile as any)?.bio || '',
            job_title: (profile as any)?.job_title || '',
            linkedin_url: (profile as any)?.linkedin_url || '',
            twitter_url: (profile as any)?.twitter_url || '',
            website_url: (profile as any)?.website_url || '',
        },
    })

    const passForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            if (!event.target.files || event.target.files.length === 0) return

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const filePath = `${user?.id}/${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            form.setValue('avatar_url', publicUrl)
            toast.success('Avatar uploaded successfully!')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setUploading(false)
        }
    }

    async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
        if (!user) return
        setLoading(true)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: values.full_name,
                    phone: values.phone,
                    avatar_url: values.avatar_url,
                    bio: values.bio,
                    job_title: values.job_title,
                    linkedin_url: values.linkedin_url,
                    twitter_url: values.twitter_url,
                    website_url: values.website_url,
                })
                .eq('id', user.id)

            if (error) throw error

            toast.success('Profile updated successfully')
            setTimeout(() => window.location.reload(), 500)
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
        setPassLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: values.password
            })
            if (error) throw error
            toast.success('Password updated successfully')
            passForm.reset()
        } catch (error: any) {
            toast.error(error.message || 'Failed to update password')
        } finally {
            setPassLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-4xl mx-auto p-0 overflow-hidden gap-0 border border-border shadow-sm">
                {/* Modern Profile Header */}
                <div className="relative h-32 w-full bg-gradient-to-br from-primary via-primary/80 to-accent/50 overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    <div className="absolute -bottom-1 left-0 w-full h-16 bg-gradient-to-t from-background to-transparent" />
                </div>

                <div className="px-6 pb-6 relative">
                    <div className="flex justify-between items-end -translate-y-8 mb-4">
                        <div className="relative group">
                            <PremiumAvatar
                                src={form.watch('avatar_url') || profile?.avatar_url || undefined}
                                fallback={profile?.full_name?.slice(0, 2).toUpperCase() || profile?.email?.slice(0, 2).toUpperCase() || 'U'}
                                size="xxl"
                                className="ring-4 ring-background shadow-xl"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-1 right-1 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95 z-10"
                                title="Change avatar"
                            >
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                            />
                        </div>
                        <div className="flex flex-col items-end pb-2">
                            <h2 className="text-2xl font-bold tracking-tight">{profile?.full_name || 'Incognito'}</h2>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{profile?.role || 'viewer'}</p>
                        </div>
                    </div>

                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 h-12 items-stretch">
                            <TabsTrigger value="general" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all rounded-md">
                                <User className="h-4 w-4 mr-2" />
                                General
                            </TabsTrigger>
                            <TabsTrigger value="security" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all rounded-md">
                                <Lock className="h-4 w-4 mr-2" />
                                Security
                            </TabsTrigger>
                            <TabsTrigger value="social" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all rounded-md">
                                <LinkIcon className="h-4 w-4 mr-2" />
                                Social
                            </TabsTrigger>
                        </TabsList>

                        {/* General Tab */}
                        <TabsContent value="general" className="mt-6 space-y-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="full_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Full Name</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                                            <Input placeholder="John Doe" {...field} className="pl-10 bg-muted/30 border-none h-11 focus-visible:ring-primary" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="job_title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Professional Title</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                                            <Input placeholder="Project Manager" {...field} value={field.value || ''} className="pl-10 bg-muted/30 border-none h-11 focus-visible:ring-primary" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Email Address</Label>
                                            <div className="relative opacity-60">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                                <Input value={user?.email || ''} disabled className="pl-10 bg-muted/30 border-none h-11" />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground italic">Email changes are restricted.</p>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Phone Number</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                                            <Input placeholder="+1234567890" {...field} value={field.value || ''} className="pl-10 bg-muted/30 border-none h-11 focus-visible:ring-primary" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Bio / Tagline</FormLabel>
                                                <FormControl>
                                                    <textarea
                                                        placeholder="Tell us a bit about yourself..."
                                                        className="flex min-h-[80px] w-full rounded-md border-none bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Profile Changes
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="mt-6 space-y-6">
                            <Form {...passForm}>
                                <form onSubmit={passForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                    <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex items-start gap-4 mb-2">
                                        <Lock className="h-5 w-5 text-yellow-600 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-yellow-700">Security Best Practices</p>
                                            <p className="text-xs text-yellow-600/80 leading-snug">Ensure your new password uses at least 6 characters including letters, numbers, and symbols.</p>
                                        </div>
                                    </div>

                                    <FormField
                                        control={passForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground">New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} className="bg-muted/30 border-none h-11 focus-visible:ring-primary" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={passForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Confirm New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} className="bg-muted/30 border-none h-11 focus-visible:ring-primary" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={passLoading} className="w-full h-11 font-bold">
                                        {passLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Update Password
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* Social Tab */}
                        <TabsContent value="social" className="mt-6 space-y-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="linkedin_url"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground">LinkedIn URL</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                                        <Input placeholder="https://linkedin.com/in/username" {...field} value={field.value || ''} className="pl-10 bg-muted/30 border-none h-11 focus-visible:ring-primary" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="twitter_url"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Twitter / X URL</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                                        <Input placeholder="https://x.com/username" {...field} value={field.value || ''} className="pl-10 bg-muted/30 border-none h-11 focus-visible:ring-primary" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="website_url"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Personal Website</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                                        <Input placeholder="https://example.com" {...field} value={field.value || ''} className="pl-10 bg-muted/30 border-none h-11 focus-visible:ring-primary" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 font-bold">
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save All Social Links
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </div>
        </Card>
    )
}
