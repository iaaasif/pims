import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface GeneralConfig {
    currency: string
    autoLogout: string
    maintenanceMode: boolean
    debugMode: boolean
    publicRegistration: boolean
    [key: string]: any
}

interface SettingsContextType {
    currency: string
    currencySymbol: string
    autoLogout: number
    maintenanceMode: boolean
    debugMode: boolean
    publicRegistration: boolean
    loading: boolean
    refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    BDT: '৳',
    EUR: '€',
    GBP: '£',
    AED: 'د.إ',
    INR: '₹',
    SAR: 'ر.س',
    PKR: '₨'
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState('USD')
    const [autoLogout, setAutoLogout] = useState(30)
    const [maintenanceMode, setMaintenanceMode] = useState(false)
    const [debugMode, setDebugMode] = useState(false)
    const [publicRegistration, setPublicRegistration] = useState(true)
    const [loading, setLoading] = useState(true)

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'general_config')
                .maybeSingle()

            if (error) {
                console.error('SettingsContext: Error fetching general_config:', error)
                return
            }

            if (data && data.value) {
                const config = data.value as GeneralConfig
                console.log('SettingsContext: Loaded config:', config)
                if (config.currency) setCurrency(config.currency)
                if (config.autoLogout) setAutoLogout(Number(config.autoLogout) || 30)
                if (config.maintenanceMode !== undefined) setMaintenanceMode(config.maintenanceMode)
                if (config.debugMode !== undefined) setDebugMode(config.debugMode)
                if (config.publicRegistration !== undefined) setPublicRegistration(config.publicRegistration)
            } else {
                console.warn('SettingsContext: No general_config found, using defaults.')
            }
        } catch (error) {
            console.error('Error fetching system settings:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    const value = {
        currency,
        currencySymbol: CURRENCY_SYMBOLS[currency] || currency,
        autoLogout,
        maintenanceMode,
        debugMode,
        publicRegistration,
        loading,
        refreshSettings: fetchSettings
    }

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return context
}
