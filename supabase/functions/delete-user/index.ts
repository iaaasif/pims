import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req: Request) => {
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { userId, requestingUserId } = await req.json();

        if (!userId) {
            return new Response(
                JSON.stringify({ status: 'error', message: 'User ID is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (!requestingUserId) {
            return new Response(
                JSON.stringify({ status: 'error', message: 'Requesting user ID is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Create admin client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Check if the requesting user is an admin
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', requestingUserId)
            .single();

        if (profileError || !profile || profile.role !== 'admin') {
            return new Response(
                JSON.stringify({ status: 'error', message: 'Unauthorized - Admin access required' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Delete related records first to avoid constraint violations
        // Delete notifications
        const { error: notifError } = await supabaseAdmin
            .from('notifications')
            .delete()
            .eq('user_id', userId);

        if (notifError) {
            console.error('Error deleting notifications:', notifError);
        }

        // Delete user profile
        const { error: deleteProfileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (deleteProfileError) {
            console.error('Error deleting profile:', deleteProfileError);
        }

        // Delete any other related records
        // Purchase requisitions requested by user
        const { error: prError } = await supabaseAdmin
            .from('purchase_requisitions')
            .update({ requested_by: null })
            .eq('requested_by', userId);

        if (prError) {
            console.error('Error updating purchase requisitions:', prError);
        }

        // Purchase orders approved/cancelled by user
        const { error: poError } = await supabaseAdmin
            .from('purchase_orders')
            .update({ approved_by: null, cancelled_by: null })
            .eq('approved_by', userId)
            .eq('cancelled_by', userId);

        if (poError) {
            console.error('Error updating purchase orders:', poError);
        }

        // Finally, delete the user from auth
        try {
            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
            if (deleteError) {
                console.error('Auth delete error:', deleteError);
                throw deleteError;
            }
        } catch (authError: any) {
            console.error('Failed to delete from auth:', authError);
            // Return partial success - user data is deleted but auth record remains
            return new Response(
                JSON.stringify({ 
                    status: 'partial', 
                    message: 'User data deleted but auth record could not be removed. Please contact support.',
                    error: authError.message
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ status: 'success', message: 'User deleted successfully' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Error in delete-user function:', error);
        
        // Check if it's an auth error
        if (error.message?.includes('JWT') || error.message?.includes('token') || error.message?.includes('auth')) {
            return new Response(
                JSON.stringify({ 
                    status: 'error', 
                    message: 'Authentication error: ' + error.message,
                    details: error.toString()
                }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }
        
        return new Response(
            JSON.stringify({ 
                status: 'error', 
                message: error.message || 'Failed to delete user',
                details: error.toString()
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
