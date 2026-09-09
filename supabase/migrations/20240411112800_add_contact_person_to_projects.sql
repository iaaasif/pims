-- Add contact person fields to projects table
ALTER TABLE projects 
ADD COLUMN contact_person TEXT,
ADD COLUMN contact_person_phone TEXT;
