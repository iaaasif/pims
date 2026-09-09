import {
    Filter,
    Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TableToolbarProps {
    onSearch?: (value: string) => void
    onFilter?: () => void
    searchPlaceholder?: string
}

export function TableToolbar({
    onSearch,
    onFilter,
    searchPlaceholder = "Search here..."
}: TableToolbarProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={searchPlaceholder}
                    className="pl-9 h-10 bg-background border-border shadow-sm focus-visible:ring-primary/50"
                    onChange={(e) => onSearch?.(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-4 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary font-bold gap-2 shadow-sm"
                    onClick={onFilter}
                >
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
            </div>
        </div>
    )
}
