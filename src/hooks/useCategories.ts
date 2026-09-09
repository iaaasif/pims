import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface MaterialCategory {
    id: string
    name: string
    description: string | null
    created_at: string
    updated_at: string
}

export function useCategories() {
    const [categories, setCategories] = useState<MaterialCategory[]>([])
    const [loading, setLoading] = useState(true)

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('material_categories')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            setCategories(data || [])
        } catch (error: any) {
            console.error('Error fetching categories:', error)
            toast.error('Failed to load categories')
        } finally {
            setLoading(false)
        }
    }

    const addCategory = async (categoryData: { name: string; description?: string }) => {
        try {
            const { data, error } = await supabase
                .from('material_categories')
                .insert([categoryData])
                .select()
                .single()

            if (error) throw error

            toast.success('Category added successfully')
            await fetchCategories()
            return { data, error: null }
        } catch (error: any) {
            console.error('Error adding category:', error)
            toast.error(error.message || 'Failed to add category')
            return { data: null, error }
        }
    }

    const updateCategory = async (id: string, categoryData: { name?: string; description?: string }) => {
        try {
            const { data, error } = await supabase
                .from('material_categories')
                .update(categoryData)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            toast.success('Category updated successfully')
            await fetchCategories()
            return { data, error: null }
        } catch (error: any) {
            console.error('Error updating category:', error)
            toast.error(error.message || 'Failed to update category')
            return { data: null, error }
        }
    }

    const deleteCategory = async (id: string) => {
        try {
            const { error } = await supabase
                .from('material_categories')
                .delete()
                .eq('id', id)

            if (error) throw error

            toast.success('Category deleted successfully')
            await fetchCategories()
            return { error: null }
        } catch (error: any) {
            console.error('Error deleting category:', error)
            toast.error(error.message || 'Failed to delete category')
            return { error }
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    return {
        categories,
        loading,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory
    }
}
