-- Normalize roles.permissions to be a JSON array of strings
-- Idempotent: only transforms objects of shape {"permissions": [...]} or empty objects

BEGIN;

-- Update rows where permissions is an object with key 'permissions'
UPDATE roles
SET permissions = (permissions->'permissions')
WHERE jsonb_typeof(permissions) = 'object'
  AND permissions ? 'permissions'
  AND jsonb_typeof(permissions->'permissions') = 'array';

-- Replace empty object {} with empty array []
UPDATE roles
SET permissions = '[]'::jsonb
WHERE permissions = '{}'::jsonb;

COMMIT;
