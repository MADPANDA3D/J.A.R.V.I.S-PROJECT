-- Create conversation_sessions table for conversation organization
CREATE TABLE IF NOT EXISTS public.conversation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'New Conversation',
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user_id ON public.conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_created_at ON public.conversation_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_status ON public.conversation_sessions(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own conversation sessions" ON public.conversation_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversation sessions" ON public.conversation_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation sessions" ON public.conversation_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversation sessions" ON public.conversation_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_conversation_sessions_updated_at
    BEFORE UPDATE ON public.conversation_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.conversation_sessions TO authenticated;
GRANT ALL ON public.conversation_sessions TO service_role;

-- Update messages table to ensure it references conversation_sessions correctly
-- Also rename it to match what the code expects (chat_messages)
ALTER TABLE public.messages RENAME TO chat_messages;

-- Add foreign key constraint from messages to conversation_sessions
ALTER TABLE public.chat_messages 
ADD CONSTRAINT fk_chat_messages_conversation_id 
FOREIGN KEY (conversation_id) REFERENCES public.conversation_sessions(id) ON DELETE SET NULL;

-- Function to automatically update message count in conversation_sessions
CREATE OR REPLACE FUNCTION public.update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Create a new conversation session if none exists
        IF NEW.conversation_id IS NULL THEN
            INSERT INTO public.conversation_sessions (user_id, title)
            VALUES (NEW.user_id, 'New Conversation')
            RETURNING id INTO NEW.conversation_id;
        END IF;
        
        -- Update message count
        UPDATE public.conversation_sessions 
        SET message_count = message_count + 1,
            updated_at = NOW()
        WHERE id = NEW.conversation_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrease message count
        UPDATE public.conversation_sessions 
        SET message_count = GREATEST(message_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.conversation_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update conversation message count
CREATE TRIGGER update_conversation_message_count_trigger
    AFTER INSERT OR DELETE ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_message_count();

-- Function to automatically update conversation session title based on first message
CREATE OR REPLACE FUNCTION public.update_conversation_title()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    first_message TEXT;
    generated_title TEXT;
BEGIN
    -- Only update title for new messages in conversations
    IF TG_OP = 'INSERT' AND NEW.role = 'user' THEN
        -- Check if this is the first message in the conversation
        SELECT message_count INTO current_count 
        FROM public.conversation_sessions 
        WHERE id = NEW.conversation_id;
        
        -- If it's the first message, generate a title from the content
        IF current_count = 1 THEN
            -- Take first 50 characters of the message as title
            generated_title := substring(NEW.content from 1 for 50);
            IF length(NEW.content) > 50 THEN
                generated_title := generated_title || '...';
            END IF;
            
            UPDATE public.conversation_sessions
            SET title = generated_title,
                updated_at = NOW()
            WHERE id = NEW.conversation_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update conversation title
CREATE TRIGGER update_conversation_title_trigger
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_title();