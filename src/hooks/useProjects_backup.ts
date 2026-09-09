import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Project {
    id: string
    name: string
    code: string
    location_id: string
    project_address?: string
    start_date: string
    end_date: string | null
    status: 'active' | 'completed' | 'on_hold' | 'cancelled'
    created_at: string
    location?: {
        name: string
        code: string
        address: string
    }
}

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchProjects() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('projects')
                .select(`
          *,
          location:locations (
            name,
            code,
            address
          )
        `)
                .order('created_at', { ascending: false })

            if (error) throw error

            setProjects(data as Project[])
        } catch (error) {
            console.error('Error fetching projects:', error)
        } finally {
            setLoading(false)
        }
    }

    async function addProject(project: Omit<Project, 'id' | 'created_at' | 'location'>) {
        try {
            const { data, error } = await supabase
                .from('projects')
                .insert([project])
                .select(`
          *,
          location:locations (
             name,
             code,
             address
          )
        `)
                .single()

            if (error) throw error

            setProjects((prev) => [data as Project, ...prev])
            return { data, error: null }
        } catch (error) {
            console.error('Error adding project:', error)
            return { data: null, error }
        }
    }

    async function updateProject(id: string, project: Partial<Omit<Project, 'id' | 'created_at' | 'location'>>) {
        try {
            const { data, error } = await supabase
                .from('projects')
                .update(project)
                .eq('id', id)
                .select(`
          *,
          location:locations (
             name,
             code,
             address
          )
        `)
                .single()

            if (error) throw error

            setProjects((prev) => prev.map(p => p.id === id ? (data as Project) : p))
            return { data, error: null }
        } catch (error) {
            console.error('Error updating project:', error)
            return { data: null, error }
        }
    }

    async function deleteProject(id: string) {
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id)

            if (error) throw error

            setProjects((prev) => prev.filter(p => p.id !== id))
            return { error: null }
        } catch (error) {
            console.error('Error deleting project:', error)
            return { error }
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    return { projects, loading, addProject, updateProject, deleteProject, refresh: fetchProjects }
}
