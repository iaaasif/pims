-- Fix viewer role permissions - should only have view and print, NO edit/create/delete
-- First, clear any incorrect permissions for viewer role
DELETE FROM role_permissions WHERE role = 'viewer';

-- Insert correct permissions for viewer (read-only)
INSERT INTO role_permissions (role, module, actions) VALUES
('viewer', 'projects', ARRAY['view', 'print']),
('viewer', 'materials', ARRAY['view', 'print']),
('viewer', 'inventory', ARRAY['view', 'print']),
('viewer', 'locations', ARRAY['view', 'print']),
('viewer', 'vendors', ARRAY['view', 'print']),
('viewer', 'purchase_requisitions', ARRAY['view', 'print']),
('viewer', 'purchase_orders', ARRAY['view', 'print']),
('viewer', 'transfers', ARRAY['view', 'print']),
('viewer', 'users', ARRAY['view', 'print']),
('viewer', 'reports', ARRAY['view', 'print']),
('viewer', 'settings', ARRAY['view', 'print']);
