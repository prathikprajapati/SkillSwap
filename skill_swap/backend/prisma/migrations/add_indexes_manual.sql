-- Manual migration to add missing foreign key indexes
-- Run this SQL directly on your MySQL database

-- Add index on Match.user2_id for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches (user2_id);

-- Add index on MatchRequest.receiver_id for incoming requests queries
CREATE INDEX IF NOT EXISTS idx_match_requests_receiver_id ON match_requests (receiver_id);

-- Add index on Message.sender_id for message filtering
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages (sender_id);

