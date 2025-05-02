-- Create rider_ratings table
CREATE TABLE rider_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rider_id UUID REFERENCES auth.users(id),
    delivery_request_id UUID REFERENCES delivery_requests(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(delivery_request_id, rider_id)
);

-- Add comment to explain the rating scale
COMMENT ON COLUMN rider_ratings.rating IS 'Rating from 1 to 5 stars';

-- Enable RLS on rider_ratings
ALTER TABLE rider_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for rider_ratings
CREATE POLICY "Users can view ratings"
    ON rider_ratings FOR SELECT
    USING (true);

CREATE POLICY "Users can rate their delivery riders"
    ON rider_ratings FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM delivery_requests
            WHERE delivery_requests.id = rider_ratings.delivery_request_id
            AND delivery_requests.user_id = auth.uid()
        )
    );

-- Add average_rating column to profiles table
ALTER TABLE profiles
ADD COLUMN average_rating NUMERIC DEFAULT 0,
ADD COLUMN total_ratings INTEGER DEFAULT 0;

-- Create function to update average rating
CREATE OR REPLACE FUNCTION update_rider_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET 
        average_rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM rider_ratings
            WHERE rider_id = NEW.rider_id
        ),
        total_ratings = (
            SELECT COUNT(*)
            FROM rider_ratings
            WHERE rider_id = NEW.rider_id
        )
    WHERE id = NEW.rider_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update average rating
CREATE TRIGGER update_rider_rating
    AFTER INSERT OR UPDATE ON rider_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_rider_average_rating(); 