import { supabase } from './supabase'

export interface SMSConfig {
    provider: 'twilio' | 'vonage' | 'bulksmsbd' | 'custom'
    gatewayUrl: string
    apiKey: string
    apiSecret: string // Used as Sender ID for BulkSMSBD
    senderId: string
    adminPhone: string
    enabled: boolean
    notifications: {
        purchase_requisitions: boolean
        purchase_orders: boolean
        transfers: boolean
        low_inventory: boolean
    }
}

/**
 * Centralized service to send SMS notifications based on system settings.
 */
export async function sendSMS(
    to: string, 
    message: string, 
    eventType?: keyof SMSConfig['notifications'],
    templateKey?: string,
    templateData?: Record<string, string | number>
) {
    try {
        // 1. Fetch SMS settings and templates from database
        const { data, error } = await supabase
            .from('system_settings')
            .select('key, value')
            .in('key', ['sms_config', 'notification_templates'])

        if (error || !data) {
            console.error('SMS Service: Failed to fetch config', error)
            return { success: false, error: 'Config not found' }
        }

        const smsConfigData = data.find(item => item.key === 'sms_config')?.value
        const templatesData = data.find(item => item.key === 'notification_templates')?.value

        if (!smsConfigData) {
            return { success: false, error: 'SMS Config not found' }
        }

        const config = smsConfigData as SMSConfig

        // 2. Check if SMS globally enabled
        if (!config.enabled) {
            console.log('SMS Service: Globally disabled')
            return { success: false, error: 'SMS disabled' }
        }

        // 3. Check if specific event enabled
        if (eventType && config.notifications && !config.notifications[eventType]) {
            console.log(`SMS Service: Notification for ${eventType} is disabled`)
            return { success: false, error: 'Event disabled' }
        }

        // 4. Process Template if available
        let finalMessage = message
        if (templateKey && templatesData && templatesData[templateKey] && templateData) {
            let templateString = templatesData[templateKey] as string
            Object.entries(templateData).forEach(([key, val]) => {
                const regex = new RegExp(`{{${key}}}`, 'g')
                templateString = templateString.replace(regex, String(val))
            })
            finalMessage = templateString
        }

        // 5. Send via provider
        const recipient = to || config.adminPhone
        if (!recipient) {
            return { success: false, error: 'No recipient phone number' }
        }

        if (config.provider === 'bulksmsbd') {
            return await sendViaBulkSMSBD(config, recipient, finalMessage)
        }

        // Add other providers (Twilio/Vonage) logic here if needed
        console.warn(`SMS Service: Provider ${config.provider} not fully implemented for triggers yet.`)
        return { success: false, error: 'Provider not implemented' }

    } catch (error) {
        console.error('SMS Service Error:', error)
        return { success: false, error: 'Internal error' }
    }
}

async function sendViaBulkSMSBD(config: SMSConfig, to: string, message: string) {
    const url = `${config.gatewayUrl}?api_key=${config.apiKey}&type=text&number=${to}&senderid=${config.apiSecret}&message=${encodeURIComponent(message)}`

    try {
        const { data: proxyData, error: proxyError } = await supabase.functions.invoke('sms-proxy', {
            body: { url, method: 'GET' }
        });

        if (proxyError) throw proxyError;
        const data = proxyData;

        if (data.status === 'success' || data.response_code === 202) {
            console.log('SMS Sent Successfully:', data)
            return { success: true, data }
        } else {
            console.error('BulkSMSBD Error:', data)
            return { success: false, error: data.message }
        }
    } catch (err: any) {
        console.error('Proxy SMS Error:', err)
        return { success: false, error: err.message || 'Network error' }
    }
}
