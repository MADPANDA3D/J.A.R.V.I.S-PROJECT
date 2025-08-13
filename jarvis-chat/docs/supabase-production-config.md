# Supabase Production Configuration for Email Verification

## Overview
This document outlines the required Supabase project settings to ensure email verification links redirect to the production VPS instead of localhost.

## Required Configuration Steps

### 1. Update Supabase Project Settings

In your Supabase project dashboard:

1. Go to **Authentication > URL Configuration**
2. Update the following settings:

**Site URL:**
```
http://69.62.71.229:3000
```

**Redirect URLs (Add these):**
```
http://69.62.71.229:3000/auth/callback
http://69.62.71.229:3000/**
```

### 2. Environment Variables

Ensure your `.env.local` file contains:

```bash
# Production configuration
VITE_APP_DOMAIN=http://69.62.71.229:3000
VITE_SUPABASE_SITE_URL=http://69.62.71.229:3000
```

### 3. Email Templates (Optional)

If you want to customize the email verification template:

1. Go to **Authentication > Email Templates**
2. Select **Confirm signup**
3. Update the redirect URL in the template to use: `{{ .SiteURL }}/auth/callback`

## Testing

1. Register a new user account
2. Check your email for the verification link
3. The link should redirect to `http://69.62.71.229:3000/auth/callback` instead of localhost
4. The authentication flow should complete successfully

## Troubleshooting

- **Still redirecting to localhost**: Verify the Site URL is correctly set in Supabase dashboard
- **Email not received**: Check your Supabase email settings and rate limits
- **Authentication errors**: Ensure the redirect URL is added to the allowed redirect URLs list

## Security Notes

- The production VPS uses HTTP (not HTTPS) as specified in the requirements
- Ensure the VPS IP (69.62.71.229) is correctly configured and accessible
- In production environments, HTTPS is recommended for security