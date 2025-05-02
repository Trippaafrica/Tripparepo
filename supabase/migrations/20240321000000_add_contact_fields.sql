-- Add sender and receiver contact information columns to delivery_requests table
ALTER TABLE delivery_requests
ADD COLUMN sender_name TEXT,
ADD COLUMN sender_phone TEXT,
ADD COLUMN receiver_name TEXT,
ADD COLUMN receiver_phone TEXT;

-- Update any existing rows with placeholder values
UPDATE delivery_requests
SET 
    sender_name = 'Not Provided',
    sender_phone = 'Not Provided',
    receiver_name = 'Not Provided',
    receiver_phone = 'Not Provided'
WHERE 
    sender_name IS NULL 
    OR sender_phone IS NULL 
    OR receiver_name IS NULL 
    OR receiver_phone IS NULL;

-- Now add NOT NULL constraints
ALTER TABLE delivery_requests
ALTER COLUMN sender_name SET NOT NULL,
ALTER COLUMN sender_phone SET NOT NULL,
ALTER COLUMN receiver_name SET NOT NULL,
ALTER COLUMN receiver_phone SET NOT NULL;

-- Add comment to explain the columns
COMMENT ON COLUMN delivery_requests.sender_name IS 'Name of the person sending the package';
COMMENT ON COLUMN delivery_requests.sender_phone IS 'Phone number of the sender';
COMMENT ON COLUMN delivery_requests.receiver_name IS 'Name of the person receiving the package';
COMMENT ON COLUMN delivery_requests.receiver_phone IS 'Phone number of the receiver'; 