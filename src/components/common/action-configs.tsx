/* eslint-disable @typescript-eslint/no-explicit-any */
import { Download, Edit, Trash2, Eye, FileText, ArrowUpDown } from 'lucide-react'

// Common action configurations
export const vendorActions = (vendor: any, onEdit: () => void, onDelete: () => void) => [
    {
        label: 'View Details',
        icon: <Eye className="h-4 w-4" />,
        onClick: () => console.log('View vendor:', vendor.id)
    },
    {
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        onClick: onEdit
    },
    {
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: onDelete,
        variant: 'destructive' as const
    }
]

export const requisitionActions = (requisition: any, onView: () => void, onEdit: () => void, onDelete: () => void) => [
    {
        label: 'View Details',
        icon: <Eye className="h-4 w-4" />,
        onClick: onView
    },
    {
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        onClick: onEdit
    },
    {
        label: 'Create PO',
        icon: <FileText className="h-4 w-4" />,
        onClick: () => console.log('Create PO from requisition:', requisition.id)
    },
    {
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: onDelete,
        variant: 'destructive' as const
    }
]

export const orderActions = (order: any, onView: () => void, onEdit: () => void, onDelete: () => void) => [
    {
        label: 'View Details',
        icon: <Eye className="h-4 w-4" />,
        onClick: onView
    },
    {
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        onClick: onEdit
    },
    {
        label: 'Download PDF',
        icon: <Download className="h-4 w-4" />,
        onClick: () => console.log('Download order PDF:', order.id)
    },
    {
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: onDelete,
        variant: 'destructive' as const
    }
]

export const inventoryActions = (item: any, onEdit: () => void, onAdjust: () => void, onDelete: () => void) => [
    {
        label: 'View Details',
        icon: <Eye className="h-4 w-4" />,
        onClick: () => console.log('View inventory item:', item.id)
    },
    {
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        onClick: onEdit
    },
    {
        label: 'Adjust Stock',
        icon: <ArrowUpDown className="h-4 w-4" />,
        onClick: onAdjust
    },
    {
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: onDelete,
        variant: 'destructive' as const
    }
]

export const projectActions = (project: any, onEdit: () => void, onDelete: () => void) => [
    {
        label: 'View Details',
        icon: <Eye className="h-4 w-4" />,
        onClick: () => console.log('View project:', project.id)
    },
    {
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        onClick: onEdit
    },
    {
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: onDelete,
        variant: 'destructive' as const
    }
]

export const locationActions = (_location: any, onView: () => void, onEdit: () => void, onDelete: () => void) => [
    {
        label: 'View Details',
        icon: <Eye className="h-4 w-4" />,
        onClick: onView
    },
    {
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        onClick: onEdit
    },
    {
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: onDelete,
        variant: 'destructive' as const
    }
]

export const transferActions = (_transfer: any, onView: () => void, onEdit: () => void, onDelete: () => void) => [
    {
        label: 'View Details',
        icon: <Eye className="h-4 w-4" />,
        onClick: onView
    },
    {
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        onClick: onEdit
    },
    {
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: onDelete,
        variant: 'destructive' as const
    }
]
