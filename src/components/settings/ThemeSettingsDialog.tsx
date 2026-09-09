import { useTheme } from '@/components/theme-provider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Pipette, Sun, Moon, Monitor } from 'lucide-react'

export function ThemeSettingsPanel() {
    const { theme, setTheme, colorScheme, setColorScheme, customColor, setCustomColor } = useTheme()

    return (
        <div className="w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Appearance Settings</h1>
                    <p className="text-muted-foreground">Customize how the application looks for you.</p>
                </div>
                <div className="grid gap-6 py-4">
                    <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Theme Mode</Label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'light', label: 'Light', icon: Sun },
                                { id: 'dark', label: 'Dark', icon: Moon },
                                { id: 'system', label: 'System', icon: Monitor },
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setTheme(mode.id as any)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all hover:bg-accent",
                                        theme === mode.id
                                            ? "border-primary bg-primary/5 text-primary shadow-md shadow-primary/10"
                                            : "border-transparent bg-muted/50 text-muted-foreground"
                                    )}
                                >
                                    <mode.icon className={cn("h-5 w-5", theme === mode.id && "animate-pulse")} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{mode.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="color" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Modern Color Scheme</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
                                { id: 'blue', label: 'Blue', class: 'bg-blue-500' },
                                { id: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
                                { id: 'rose', label: 'Rose', class: 'bg-rose-500' },
                                { id: 'orange', label: 'Orange', class: 'bg-[#ff9900]' },
                                { id: 'custom', label: 'Custom', icon: <Pipette className="h-3 w-3" /> },
                            ].map((scheme) => (
                                <button
                                    key={scheme.id}
                                    onClick={() => setColorScheme(scheme.id as any)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all hover:bg-accent text-xs font-bold uppercase tracking-widest",
                                        colorScheme === scheme.id
                                            ? "border-primary bg-primary/5 text-primary shadow-md shadow-primary/10"
                                            : "border-transparent bg-muted/50 text-muted-foreground"
                                    )}
                                >
                                    {scheme.class ? (
                                        <div className={cn("h-4 w-4 rounded-full shadow-sm", scheme.class)} />
                                    ) : (
                                        <div
                                            className="h-4 w-4 rounded-full shadow-sm flex items-center justify-center border border-border"
                                            style={{ backgroundColor: scheme.id === 'custom' ? customColor : undefined }}
                                        >
                                            {scheme.icon}
                                        </div>
                                    )}
                                    {scheme.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {colorScheme === 'custom' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Label htmlFor="custom-color" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pick Your Primary Color</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        id="custom-color"
                                        type="color"
                                        value={customColor}
                                        onChange={(e) => setCustomColor(e.target.value)}
                                        className="h-11 w-full p-1 rounded-xl cursor-pointer bg-background"
                                    />
                                </div>
                                <Input
                                    type="text"
                                    value={customColor.toUpperCase()}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    className="w-28 font-mono h-11 rounded-xl text-center"
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-2 border-t border-border">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2 text-center opacity-70">
                            Premium Design System (Active)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
