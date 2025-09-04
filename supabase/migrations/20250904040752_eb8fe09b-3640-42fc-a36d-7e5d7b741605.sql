-- Remove sample/fake activity logs that were inserted automatically
DELETE FROM activity_logs 
WHERE action_description IN (
  'Changed password',
  'Added new contact', 
  'Uploaded insurance document',
  'Updated medical information',
  'Created emergency contact information'
) 
AND created_at >= '2025-09-04 03:55:00'
AND created_at <= '2025-09-04 03:56:00';