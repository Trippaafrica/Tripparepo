-- Add sender and receiver contact information columns to delivery_requests table
ALTER TABLE delivery_requests
ADD COLUMN sender_name TEXT NOT NULL,
ADD COLUMN sender_phone TEXT NOT NULL,
ADD COLUMN receiver_name TEXT NOT NULL,
ADD COLUMN receiver_phone TEXT NOT NULL;

-- Add comment to explain the new columns
COMMENT ON COLUMN delivery_requests.sender_name IS 'Name of the person sending the package';
COMMENT ON COLUMN delivery_requests.sender_phone IS 'Phone number of the sender';
COMMENT ON COLUMN delivery_requests.receiver_name IS 'Name of the person receiving the package';
COMMENT ON COLUMN delivery_requests.receiver_phone IS 'Phone number of the receiver'; 