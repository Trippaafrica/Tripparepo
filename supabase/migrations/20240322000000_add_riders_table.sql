-- Document existing riders table
CREATE TABLE IF NOT EXISTS riders (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    rating NUMERIC DEFAULT 0,
    CONSTRAINT rating_range CHECK (rating >= 0 AND rating <= 5)
);

-- Enable RLS
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON riders FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own rider profile"
    ON riders FOR UPDATE
    USING (auth.uid() = id);

-- Add comment
COMMENT ON TABLE riders IS 'Stores rider-specific information including their rating';
COMMENT ON COLUMN riders.rating IS 'Rider rating from 0 to 5'; 