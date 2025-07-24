# Supabase Database Setup for JARVIS Chat

This document outlines the database configuration required for the JARVIS chat application authentication system.

## Environment Variables

Before setting up the database, ensure you have the following environment variables configured in your `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Required Database Schema

### User Profile Table

While Supabase provides authentication out of the box, you may want to create additional user profile information:

```sql
-- Create a public profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policy to allow users to view their own profile
create policy "Public profiles are viewable by owner." on public.profiles
  for select using (auth.uid() = id);

-- Create policy to allow users to insert their own profile
create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

-- Create policy to allow users to update their own profile
create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Create a function to automatically create a profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Create a trigger to call the function on user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Authentication Settings

In your Supabase dashboard, configure the following authentication settings:

### General Settings

- **Site URL**: `http://localhost:5173` (development) / `https://jarvis.madpanda3d.com` (production)
- **Additional redirect URLs**: Add any additional domains you'll use

### Email Settings

- **Enable email confirmations**: Recommended for production
- **Enable email change confirmations**: Recommended for production
- **Enable email double opt-in**: Optional based on your requirements

### Security Settings

- **JWT expiry**: 3600 seconds (1 hour) - default is fine
- **Refresh token rotation**: Enable for enhanced security
- **Session timeout**: Configure based on your requirements

## Row Level Security (RLS) Policies

The application assumes the following RLS policies are in place:

### Profiles Table Policies

```sql
-- Users can view their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
```

### Future Chat Tables (from upcoming stories)

The following policies will be needed for future chat functionality:

```sql
-- Messages table (to be created in Story 001.006)
create policy "Users can view own messages" on public.messages
  for select using (auth.uid() = user_id);

create policy "Users can insert own messages" on public.messages
  for insert with check (auth.uid() = user_id);

-- Chats table (to be created in Story 001.006)
create policy "Users can view own chats" on public.chats
  for select using (auth.uid() = user_id);

create policy "Users can insert own chats" on public.chats
  for insert with check (auth.uid() = user_id);
```

## Testing the Setup

To verify your Supabase configuration is correct:

1. **Test Authentication Flow**:
   - Try registering a new user
   - Check if email confirmation works (if enabled)
   - Test login with valid credentials
   - Test login with invalid credentials

2. **Test RLS Policies**:
   - Verify users can only access their own data
   - Test that unauthorized access is blocked

3. **Check Database Triggers**:
   - Verify that profile records are created automatically on user signup

## Production Considerations

### Security

- Enable email confirmation for new users
- Set up proper CORS origins
- Configure rate limiting appropriately
- Use environment-specific redirect URLs

### Performance

- Consider connection pooling if needed
- Monitor authentication API usage
- Set up proper indexing on user-related tables

### Monitoring

- Set up Supabase monitoring and alerts
- Monitor authentication success/failure rates
- Track user registration patterns

## Troubleshooting

### Common Issues

1. **"Invalid JWT" errors**:
   - Check that environment variables are correctly set
   - Verify that the Supabase URL and anon key match your project

2. **RLS policy violations**:
   - Ensure RLS policies are properly configured
   - Check that auth.uid() is correctly referenced in policies

3. **Email confirmation not working**:
   - Check email templates in Supabase dashboard
   - Verify redirect URLs are correctly configured
   - Check spam folders during testing

4. **CORS errors**:
   - Add your domain to the allowed origins in Supabase settings
   - Ensure Site URL is correctly configured

## Next Steps

After completing this setup:

1. Test the authentication flow in your application
2. Verify that protected routes work correctly
3. Check that user sessions persist across browser restarts
4. Prepare for the next story (001.003) which will build upon this authentication foundation

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-api)
