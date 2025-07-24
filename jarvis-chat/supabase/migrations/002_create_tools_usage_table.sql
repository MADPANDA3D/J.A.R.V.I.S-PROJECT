-- Create tools_usage table for analytics tracking
CREATE TABLE tools_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tools_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tools_usage
CREATE POLICY "Users can view own tool usage" 
ON tools_usage FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tool usage" 
ON tools_usage FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tool usage" 
ON tools_usage FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_tools_usage_user_tool ON tools_usage(user_id, tool_id);
CREATE INDEX idx_tools_usage_user_session ON tools_usage(user_id, session_id);
CREATE INDEX idx_tools_usage_last_used ON tools_usage(user_id, last_used DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tools_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER trigger_update_tools_usage_updated_at
  BEFORE UPDATE ON tools_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_tools_usage_updated_at();

-- Create or update function for upsert operations
CREATE OR REPLACE FUNCTION upsert_tool_usage(
  p_user_id UUID,
  p_tool_id TEXT,
  p_tool_name TEXT,
  p_session_id TEXT
) RETURNS UUID AS $$
DECLARE
  result_id UUID;
BEGIN
  -- Try to update existing record
  UPDATE tools_usage 
  SET 
    usage_count = usage_count + 1,
    last_used = NOW(),
    updated_at = NOW()
  WHERE 
    user_id = p_user_id 
    AND tool_id = p_tool_id 
    AND session_id = p_session_id
  RETURNING id INTO result_id;
  
  -- If no record was updated, insert a new one
  IF result_id IS NULL THEN
    INSERT INTO tools_usage (user_id, tool_id, tool_name, session_id, usage_count)
    VALUES (p_user_id, p_tool_id, p_tool_name, p_session_id, 1)
    RETURNING id INTO result_id;
  END IF;
  
  RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_tool_usage(UUID, TEXT, TEXT, TEXT) TO authenticated;