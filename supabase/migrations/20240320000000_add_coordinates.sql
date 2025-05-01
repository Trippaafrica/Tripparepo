-- Add coordinates columns to delivery_requests table
ALTER TABLE delivery_requests
ADD COLUMN pickup_coordinates JSONB,
ADD COLUMN dropoff_coordinates JSONB;

-- Add comment to explain the JSONB structure
COMMENT ON COLUMN delivery_requests.pickup_coordinates IS 'JSON object containing lat and lng coordinates for pickup location';
COMMENT ON COLUMN delivery_requests.dropoff_coordinates IS 'JSON object containing lat and lng coordinates for dropoff location'; 