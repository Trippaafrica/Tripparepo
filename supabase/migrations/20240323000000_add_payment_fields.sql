-- Add payment status and reference columns to delivery_requests table
ALTER TABLE delivery_requests
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
ADD COLUMN payment_reference TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN delivery_requests.payment_status IS 'Status of payment: pending, paid, or failed';
COMMENT ON COLUMN delivery_requests.payment_reference IS 'Reference ID from Paystack payment'; 