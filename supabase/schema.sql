-- Create delivery_requests table
CREATE TABLE delivery_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    delivery_type TEXT NOT NULL CHECK (delivery_type IN ('bike', 'truck', 'van', 'fuel')),
    pickup_location TEXT NOT NULL,
    dropoff_location TEXT NOT NULL,
    item_description TEXT NOT NULL,
    weight NUMERIC,
    dimensions TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create bids table
CREATE TABLE bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delivery_request_id UUID REFERENCES delivery_requests(id) ON DELETE CASCADE,
    rider_id UUID REFERENCES auth.users(id),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    estimated_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies for delivery_requests
ALTER TABLE delivery_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own delivery requests"
    ON delivery_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own delivery requests"
    ON delivery_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own delivery requests"
    ON delivery_requests FOR UPDATE
    USING (auth.uid() = user_id);

-- Create RLS policies for bids
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bids for their delivery requests"
    ON bids FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM delivery_requests
            WHERE delivery_requests.id = bids.delivery_request_id
            AND delivery_requests.user_id = auth.uid()
        )
    );

CREATE POLICY "Riders can create bids"
    ON bids FOR INSERT
    WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Users can update bids for their delivery requests"
    ON bids FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM delivery_requests
            WHERE delivery_requests.id = bids.delivery_request_id
            AND delivery_requests.user_id = auth.uid()
        )
    ); 