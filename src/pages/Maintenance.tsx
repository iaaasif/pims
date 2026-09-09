import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function Maintenance() {
    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    <div className="p-4 bg-primary/10 rounded-full animate-bounce">
                        <ShieldAlert className="h-16 w-16 text-primary" />
                    </div>
                </div>
                
                <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight">System Maintenance</h1>
                    <p className="text-xl text-muted-foreground">
                        We're currently performing some scheduled updates to improve your experience.
                    </p>
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                        <p className="text-sm font-medium">
                            Expected downtime: 30-60 minutes
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button 
                        size="lg" 
                        variant="outline"
                        onClick={() => window.location.reload()}
                    >
                        Check Again
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                    PIMS v2.4.0 • Enterprise Edition
                </p>
            </div>
        </div>
    )
}
