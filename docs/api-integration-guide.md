# JARVIS Chat API Integration Guide

This comprehensive guide provides everything you need to integrate with the JARVIS Chat API, including authentication, common use cases, and best practices.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication](#authentication)
3. [Common Integration Patterns](#common-integration-patterns)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [SDK Examples](#sdk-examples)
7. [Webhook Integration](#webhook-integration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Get Your API Credentials

Before you can start using the API, you'll need to:

1. Register for an account at [JARVIS Chat Portal](https://jarvis.madpanda3d.com)
2. Obtain your API credentials from the developer dashboard
3. Configure your application with the base URL and credentials

### 2. Base URLs

| Environment | Base URL |
|-------------|----------|
| Production | `https://jarvis.madpanda3d.com/api` |
| Staging | `https://staging-jarvis.madpanda3d.com/api` |
| Development | `http://localhost:5173/api` |

### 3. Your First Request

```bash
# Test the API health endpoint
curl -X GET "https://jarvis.madpanda3d.com/api/health" \
  -H "Accept: application/json"
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "version": "1.0.0",
  "environment": "production"
}
```

## Authentication

The JARVIS Chat API uses JWT-based authentication. All authenticated requests must include the `Authorization` header with a valid Bearer token.

### Getting an Access Token

```bash
curl -X POST "https://jarvis.madpanda3d.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "your-email@example.com",
      "name": "Your Name"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_at": "2025-01-15T18:30:00Z"
    }
  }
}
```

### Using the Access Token

Include the access token in the Authorization header for all subsequent requests:

```bash
curl -X GET "https://jarvis.madpanda3d.com/api/messages" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Accept: application/json"
```

### Token Refresh

When your access token expires, use the refresh token to get a new one:

```bash
curl -X POST "https://jarvis.madpanda3d.com/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

## Common Integration Patterns

### 1. Send a Message and Get Response

```javascript
// JavaScript/Node.js example
async function sendMessage(accessToken, message) {
  const response = await fetch('https://jarvis.madpanda3d.com/api/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: message,
      metadata: {
        source: 'web',
        context: 'general'
      }
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Usage
try {
  const result = await sendMessage(accessToken, 'Hello, how can you help me today?');
  console.log('User message:', result.data.user_message.content);
  console.log('Assistant response:', result.data.assistant_message.content);
} catch (error) {
  console.error('Error sending message:', error);
}
```

### 2. Get Message History

```python
# Python example
import requests
from typing import List, Dict, Optional

class JarvisClient:
    def __init__(self, base_url: str, access_token: str):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

    def get_messages(self, limit: int = 20, offset: int = 0, 
                    search: Optional[str] = None) -> Dict:
        """Get message history with optional search"""
        params = {'limit': limit, 'offset': offset}
        if search:
            params['search'] = search

        response = requests.get(
            f'{self.base_url}/messages',
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()

    def send_message(self, content: str, context: str = 'general') -> Dict:
        """Send a message to the AI assistant"""
        payload = {
            'content': content,
            'metadata': {
                'source': 'api',
                'context': context
            }
        }

        response = requests.post(
            f'{self.base_url}/messages',
            headers=self.headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()

# Usage
client = JarvisClient('https://jarvis.madpanda3d.com/api', access_token)

# Get recent messages
messages = client.get_messages(limit=10)
print(f"Found {len(messages['data']['messages'])} messages")

# Send a message
response = client.send_message('What are the best practices for API design?')
print(response['data']['assistant_message']['content'])
```

### 3. User Registration and Authentication Flow

```typescript
// TypeScript example
interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
    };
    session: {
      access_token: string;
      refresh_token: string;
      expires_at: string;
    };
  };
}

class AuthManager {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Registration failed');
    }

    const result: AuthResponse = await response.json();
    this.setTokens(result.data.session);
    return result;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Login failed');
    }

    const result: AuthResponse = await response.json();
    this.setTokens(result.data.session);
    return result;
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify({ refresh_token: this.refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const result = await response.json();
    this.accessToken = result.data.access_token;
    return this.accessToken;
  }

  private setTokens(session: AuthResponse['data']['session']): void {
    this.accessToken = session.access_token;
    this.refreshToken = session.refresh_token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}
```

## Error Handling

The API uses standard HTTP status codes and returns detailed error information:

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The provided data failed validation",
    "details": {
      "email": "Email format is invalid",
      "password": "Password must be at least 8 characters"
    },
    "trace_id": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_FAILED` | Request validation failed |
| 401 | `UNAUTHORIZED` | Authentication required |
| 401 | `INVALID_TOKEN` | Invalid or expired token |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `USER_EXISTS` | User already exists |
| 429 | `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Server error |

### Error Handling Best Practices

```javascript
async function apiRequest(url, options) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      
      switch (response.status) {
        case 401:
          if (errorData.error?.code === 'INVALID_TOKEN') {
            // Try to refresh token
            await refreshAccessToken();
            // Retry the original request
            return apiRequest(url, options);
          }
          throw new Error('Authentication failed');
          
        case 429:
          const retryAfter = errorData.error?.details?.retry_after_seconds || 60;
          throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
          
        case 500:
          throw new Error('Server error. Please try again later');
          
        default:
          throw new Error(errorData.error?.message || 'Request failed');
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

| Endpoint Category | Rate Limit |
|------------------|------------|
| Authentication | 10 requests/minute |
| Standard endpoints | 100 requests/minute |
| Health endpoints | 1000 requests/minute |

### Rate Limit Headers

The API includes rate limit information in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

### Handling Rate Limits

```javascript
function parseRateLimitHeaders(response) {
  return {
    limit: parseInt(response.headers.get('X-RateLimit-Limit')),
    remaining: parseInt(response.headers.get('X-RateLimit-Remaining')),
    reset: new Date(parseInt(response.headers.get('X-RateLimit-Reset')) * 1000)
  };
}

async function makeRequestWithRateLimit(url, options) {
  const response = await fetch(url, options);
  const rateLimit = parseRateLimitHeaders(response);
  
  if (response.status === 429) {
    const waitTime = rateLimit.reset.getTime() - Date.now();
    console.log(`Rate limited. Waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return makeRequestWithRateLimit(url, options);
  }
  
  return response;
}
```

## SDK Examples

### cURL Examples

```bash
# Get user profile
curl -X GET "https://jarvis.madpanda3d.com/api/users/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Accept: application/json"

# Update user preferences
curl -X PUT "https://jarvis.madpanda3d.com/api/users/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "theme": "dark",
      "language": "en",
      "notifications": true
    }
  }'

# Search messages
curl -X GET "https://jarvis.madpanda3d.com/api/messages?search=deployment&limit=5" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Accept: application/json"

# Get system metrics
curl -X GET "https://jarvis.madpanda3d.com/api/metrics?timeRange=60&category=performance" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Accept: application/json"
```

### Postman Collection

```json
{
  "info": {
    "name": "JARVIS Chat API",
    "description": "Complete API collection for JARVIS Chat",
    "version": "1.0.0"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{access_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://jarvis.madpanda3d.com/api"
    },
    {
      "key": "access_token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/login",
              "host": ["{{base_url}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    }
  ]
}
```

## Webhook Integration

For real-time notifications and integrations, you can configure webhooks:

### Webhook Configuration

```javascript
// Configure webhook endpoint
const webhookConfig = {
  url: 'https://your-app.com/webhooks/jarvis',
  events: ['message.created', 'user.registered', 'incident.detected'],
  secret: 'your-webhook-secret'
};
```

### Webhook Payload Example

```json
{
  "event": "message.created",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "message": {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "content": "Hello, world!",
      "role": "user",
      "created_at": "2025-01-15T10:30:00Z"
    },
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com"
    }
  }
}
```

### Webhook Verification

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    """Verify webhook signature"""
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(f'sha256={expected_signature}', signature)

# Usage in Flask
from flask import Flask, request

app = Flask(__name__)

@app.route('/webhooks/jarvis', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.get_data(as_text=True)
    
    if not verify_webhook(payload, signature, 'your-webhook-secret'):
        return 'Unauthorized', 401
    
    event_data = request.get_json()
    
    if event_data['event'] == 'message.created':
        # Handle new message
        process_new_message(event_data['data'])
    
    return 'OK', 200
```

## Best Practices

### 1. Authentication Management

- Store tokens securely (use secure storage/keychain)
- Implement automatic token refresh
- Handle authentication errors gracefully
- Use HTTPS for all requests

### 2. Error Handling

- Implement retry logic with exponential backoff
- Log errors with trace IDs for debugging
- Provide meaningful error messages to users
- Handle network timeouts appropriately

### 3. Performance Optimization

- Implement request caching where appropriate
- Use connection pooling for multiple requests
- Paginate large result sets
- Monitor API usage and optimize based on metrics

### 4. Security

- Never log or expose authentication tokens
- Validate all user inputs before sending to API
- Use HTTPS for all communications
- Implement proper CORS policies

### 5. Monitoring and Logging

- Log all API interactions (without sensitive data)
- Monitor response times and error rates
- Set up alerts for authentication failures
- Track API usage patterns

## Troubleshooting

### Common Issues

#### 1. Authentication Failures

**Problem**: Getting 401 Unauthorized errors

**Solutions**:
- Verify your email and password are correct
- Check if your access token has expired
- Ensure you're including the Bearer prefix in the Authorization header
- Try refreshing your token

#### 2. Rate Limiting

**Problem**: Getting 429 Too Many Requests errors

**Solutions**:
- Implement exponential backoff
- Monitor rate limit headers
- Reduce request frequency
- Consider caching responses

#### 3. Validation Errors

**Problem**: Getting 400 Bad Request with validation errors

**Solutions**:
- Check the API documentation for required fields
- Validate data formats (email, UUID, etc.)
- Ensure request body is valid JSON
- Check content-type headers

#### 4. Network Timeouts

**Problem**: Requests timing out

**Solutions**:
- Increase timeout values
- Check network connectivity
- Implement retry logic
- Monitor API status page

### Getting Help

If you need additional support:

1. Check the [API Status Page](https://status.jarvis.madpanda3d.com)
2. Review the [API Documentation](https://jarvis.madpanda3d.com/api-docs.html)
3. Contact support at [support@madpanda3d.com](mailto:support@madpanda3d.com)
4. Join our [Developer Community](https://discord.gg/jarvis-developers)

### Useful Resources

- [OpenAPI Specification](https://jarvis.madpanda3d.com/api/openapi.yaml)
- [Interactive API Explorer](https://jarvis.madpanda3d.com/api-docs.html)
- [SDK Libraries](https://github.com/madpanda3d/jarvis-sdks)
- [Code Examples](https://github.com/madpanda3d/jarvis-examples)
- [Status Page](https://status.jarvis.madpanda3d.com)

---

*Last updated: January 15, 2025*