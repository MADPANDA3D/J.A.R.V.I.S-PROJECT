-- Create bug reporting database schema for JARVIS Chat
-- This migration implements the database schema for user bug reporting system
-- with proper relationships, indexes, and Row Level Security (RLS) policies

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Bug Reports Table
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    bug_type TEXT NOT NULL CHECK (bug_type IN ('ui', 'functionality', 'performance', 'security', 'accessibility')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    
    -- Technical Information
    browser_info JSONB,
    error_stack TEXT,
    user_agent TEXT,
    url TEXT,
    reproduction_steps TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_to UUID,
    priority INTEGER DEFAULT 0,
    
    -- Error Tracking Integration
    error_context JSONB, -- From existing error tracking systems
    monitoring_data JSONB -- From APM monitoring integration
);

-- Bug Comments Table  
CREATE TABLE IF NOT EXISTS public.bug_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_report_id UUID REFERENCES public.bug_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bug Attachments Table
CREATE TABLE IF NOT EXISTS public.bug_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_report_id UUID REFERENCES public.bug_reports(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON public.bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON public.bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bug_reports_bug_type ON public.bug_reports(bug_type);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON public.bug_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_bug_reports_updated_at ON public.bug_reports(updated_at);

CREATE INDEX IF NOT EXISTS idx_bug_comments_bug_report_id ON public.bug_comments(bug_report_id);
CREATE INDEX IF NOT EXISTS idx_bug_comments_user_id ON public.bug_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_comments_created_at ON public.bug_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_bug_attachments_bug_report_id ON public.bug_attachments(bug_report_id);
CREATE INDEX IF NOT EXISTS idx_bug_attachments_uploaded_by ON public.bug_attachments(uploaded_by);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_attachments ENABLE ROW LEVEL SECURITY;

-- Bug Reports RLS Policies
CREATE POLICY "Users can view their own bug reports" ON public.bug_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bug reports" ON public.bug_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bug reports" ON public.bug_reports
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow admins to view and manage all bug reports (admin role check would be implemented in application logic)
CREATE POLICY "Service role can manage all bug reports" ON public.bug_reports
    FOR ALL USING (auth.role() = 'service_role');

-- Bug Comments RLS Policies
CREATE POLICY "Users can view comments on their bug reports" ON public.bug_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bug_reports 
            WHERE bug_reports.id = bug_comments.bug_report_id 
            AND bug_reports.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can comment on their own bug reports" ON public.bug_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.bug_reports 
            WHERE bug_reports.id = bug_comments.bug_report_id 
            AND bug_reports.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all bug comments" ON public.bug_comments
    FOR ALL USING (auth.role() = 'service_role');

-- Bug Attachments RLS Policies
CREATE POLICY "Users can view attachments on their bug reports" ON public.bug_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bug_reports 
            WHERE bug_reports.id = bug_attachments.bug_report_id 
            AND bug_reports.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload attachments to their bug reports" ON public.bug_attachments
    FOR INSERT WITH CHECK (
        auth.uid() = uploaded_by AND
        EXISTS (
            SELECT 1 FROM public.bug_reports 
            WHERE bug_reports.id = bug_attachments.bug_report_id 
            AND bug_reports.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all bug attachments" ON public.bug_attachments
    FOR ALL USING (auth.role() = 'service_role');

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_bug_reports_updated_at
    BEFORE UPDATE ON public.bug_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically update bug report status based on comments
CREATE OR REPLACE FUNCTION public.update_bug_status_on_comment()
RETURNS TRIGGER AS $$
BEGIN
    -- If a comment is added by someone other than the reporter, mark as in_progress
    IF NEW.user_id != (SELECT user_id FROM public.bug_reports WHERE id = NEW.bug_report_id) THEN
        UPDATE public.bug_reports 
        SET status = 'in_progress',
            updated_at = NOW()
        WHERE id = NEW.bug_report_id AND status = 'open';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bug_status_on_comment_trigger
    AFTER INSERT ON public.bug_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_bug_status_on_comment();

-- Function to generate bug report tracking numbers
CREATE OR REPLACE FUNCTION public.generate_bug_tracking_number()
RETURNS TRIGGER AS $$
DECLARE
    tracking_number TEXT;
    year_suffix TEXT;
    sequential_id INTEGER;
BEGIN
    -- Generate year suffix (last 2 digits of current year)
    year_suffix := to_char(NOW(), 'YY');
    
    -- Get next sequential ID for this year
    SELECT COALESCE(MAX(
        CAST(
            substring(title FROM 'BUG-' || year_suffix || '-(\d+)')
            AS INTEGER
        )
    ), 0) + 1
    INTO sequential_id
    FROM public.bug_reports
    WHERE title LIKE 'BUG-' || year_suffix || '-%';
    
    -- Generate tracking number: BUG-YY-XXXX format
    tracking_number := 'BUG-' || year_suffix || '-' || lpad(sequential_id::text, 4, '0');
    
    -- If title is generic, replace with tracking number
    IF NEW.title = 'New Bug Report' OR NEW.title IS NULL OR length(trim(NEW.title)) = 0 THEN
        NEW.title := tracking_number || ': ' || substring(NEW.description FROM 1 FOR 50);
        IF length(NEW.description) > 50 THEN
            NEW.title := NEW.title || '...';
        END IF;
    END IF;
    
    -- Store tracking number in monitoring_data for reference
    IF NEW.monitoring_data IS NULL THEN
        NEW.monitoring_data := '{}';
    END IF;
    
    NEW.monitoring_data := jsonb_set(
        NEW.monitoring_data::jsonb,
        '{tracking_number}',
        to_jsonb(tracking_number)
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_bug_tracking_number_trigger
    BEFORE INSERT ON public.bug_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_bug_tracking_number();

-- Grant necessary permissions
GRANT ALL ON public.bug_reports TO authenticated;
GRANT ALL ON public.bug_reports TO service_role;

GRANT ALL ON public.bug_comments TO authenticated;
GRANT ALL ON public.bug_comments TO service_role;

GRANT ALL ON public.bug_attachments TO authenticated;
GRANT ALL ON public.bug_attachments TO service_role;

-- Create view for bug report statistics (admin use)
CREATE OR REPLACE VIEW public.bug_report_stats AS
SELECT 
    bug_type,
    severity,
    status,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_resolution_hours
FROM public.bug_reports
GROUP BY bug_type, severity, status;

-- Grant permissions on the view
GRANT SELECT ON public.bug_report_stats TO service_role;

-- Create function to get user's bug report summary
CREATE OR REPLACE FUNCTION public.get_user_bug_summary(target_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    total_reports INTEGER,
    open_reports INTEGER,
    resolved_reports INTEGER,
    avg_response_time_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_reports,
        COUNT(CASE WHEN status IN ('open', 'in_progress') THEN 1 END)::INTEGER as open_reports,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END)::INTEGER as resolved_reports,
        COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600), 0)::NUMERIC as avg_response_time_hours
    FROM public.bug_reports 
    WHERE user_id = target_user_id;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_bug_summary(UUID) TO authenticated;

-- Insert some sample data for testing (optional - can be removed in production)
-- INSERT INTO public.bug_reports (
--     user_id, title, description, bug_type, severity, browser_info, user_agent, url
-- ) VALUES (
--     auth.uid(), 
--     'Sample Bug Report', 
--     'This is a sample bug report for testing the database schema', 
--     'functionality', 
--     'medium',
--     '{"browser": "Chrome", "version": "120.0.0.0"}',
--     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
--     'https://jarvis-chat.example.com'
-- );