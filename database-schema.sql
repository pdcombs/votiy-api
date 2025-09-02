-- Votiy Database Schema for Supabase
-- This file contains all the necessary tables and relationships for the Votiy application

-- Users table (simplified auth system)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    password_hash TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Polls table
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    short_code TEXT UNIQUE NOT NULL CHECK (length(short_code) = 5),
    start_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll sections table
CREATE TABLE IF NOT EXISTS public.poll_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll options table
CREATE TABLE IF NOT EXISTS public.poll_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID REFERENCES public.poll_sections(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, user_id) -- One vote per user per poll
);

-- Poll user access table (users who can edit a poll)
CREATE TABLE IF NOT EXISTS public.poll_user_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    access_level TEXT DEFAULT 'editor' CHECK (access_level IN ('viewer', 'editor', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON public.polls(created_by);
CREATE INDEX IF NOT EXISTS idx_polls_short_code ON public.polls(short_code);
CREATE INDEX IF NOT EXISTS idx_poll_sections_poll_id ON public.poll_sections(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_section_id ON public.poll_options(section_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_user_access_poll_id ON public.poll_user_access(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_user_access_user_id ON public.poll_user_access(user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
