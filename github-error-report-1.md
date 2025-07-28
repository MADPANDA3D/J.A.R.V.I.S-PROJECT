Run cd jarvis-chat
🧪 Running test suite...

> jarvis-chat@0.0.0 test:run
> vitest run


 RUN  v3.2.4 /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat

stdout | src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Payload Schema Validation > should reject payload with missing required fields
Validation errors: []

 ❯ src/lib/__tests__/webhookValidation.test.ts (28 tests | 9 failed) 40ms
   ✓ WebhookValidation > Webhook Payload Schema Validation > should validate a basic valid payload 5ms
   ✓ WebhookValidation > Webhook Payload Schema Validation > should validate payload with all optional fields 1ms
   × WebhookValidation > Webhook Payload Schema Validation > should reject payload with missing required fields 12ms
     → expected 0 to be greater than 0
   × WebhookValidation > Webhook Payload Schema Validation > should reject payload with invalid field types 4ms
     → expected false to be true // Object.is equality
   × WebhookValidation > Webhook Payload Schema Validation > should reject payload with extra unknown fields 1ms
     → expected false to be true // Object.is equality
   × WebhookValidation > Webhook Payload Schema Validation > should validate message length constraints 1ms
     → expected false to be true // Object.is equality
   ✓ WebhookValidation > Webhook Payload Schema Validation > should validate all supported message types 1ms
   ✓ WebhookValidation > Webhook Payload Schema Validation > should validate all supported tool IDs 0ms
   × WebhookValidation > Webhook Payload Schema Validation > should validate UUID format strictly 1ms
     → expected false to be true // Object.is equality
   ✓ WebhookValidation > Enhanced Webhook Payload Schema Validation > should validate enhanced payload with metadata 2ms
   ✓ WebhookValidation > Enhanced Webhook Payload Schema Validation > should apply default values for optional metadata fields 0ms
   × WebhookValidation > Enhanced Webhook Payload Schema Validation > should validate tool selection metadata structure 1ms
     → expected false to be true // Object.is equality
   ✓ WebhookValidation > Webhook Response Schema Validation > should validate successful webhook response 1ms
   ✓ WebhookValidation > Webhook Response Schema Validation > should validate error webhook response 0ms
   ✓ WebhookValidation > Webhook Response Schema Validation > should reject response with invalid structure 1ms
   ✓ WebhookValidation > Webhook Response Schema Validation > should validate optional response fields 0ms
   ✓ WebhookValidation > Health Check Response Schema Validation > should validate healthy status response 1ms
   ✓ WebhookValidation > Health Check Response Schema Validation > should validate degraded status response 0ms
   ✓ WebhookValidation > Health Check Response Schema Validation > should reject invalid health status values 0ms
   ✓ WebhookValidation > Health Check Response Schema Validation > should validate minimal health check response 0ms
   ✓ WebhookValidation > Validation Error Schema > should create properly structured validation errors 1ms
   ✓ WebhookValidation > WebhookValidator Utility Methods > should create validated payload with createValidatedPayload 0ms
   ✓ WebhookValidation > WebhookValidator Utility Methods > should throw error for invalid payload construction 1ms
   ✓ WebhookValidation > WebhookValidator Utility Methods > should provide validation summary 0ms
   × WebhookValidation > WebhookValidator Utility Methods > should provide detailed validation summary for invalid payload 1ms
     → expected 0 to be greater than 0
   ✓ WebhookValidation > WebhookValidator Utility Methods > should handle edge cases in validation summary 0ms
   × WebhookValidation > Schema Integration Tests > should work with real-world payload example 1ms
     → expected false to be true // Object.is equality
   × WebhookValidation > Schema Integration Tests > should handle complex validation error scenarios 1ms
     → expected 0 to be greater than 5
 ✓ src/lib/__tests__/webhookMonitoring.test.ts (27 tests) 354ms
   ✓ WebhookMonitoringService > Performance Metrics Collection > should maintain performance history size limit  330ms
 ❯ src/lib/__tests__/env-validation.enhanced.test.ts (29 tests | 22 failed) 34ms
   × Enhanced Environment Validation > Application Configuration Validation > should validate application environment correctly 8ms
     → expected undefined to be 'production' // Object.is equality
   × Enhanced Environment Validation > Application Configuration Validation > should reject invalid environment values 2ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > Application Configuration Validation > should warn about missing version in production 1ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > Application Configuration Validation > should validate domain format 1ms
     → expected false to be true // Object.is equality
   ✓ Enhanced Environment Validation > Database Configuration Validation > should require Supabase URL and key 0ms
   × Enhanced Environment Validation > Database Configuration Validation > should validate Supabase URL format 1ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > Database Configuration Validation > should warn about short Supabase keys 1ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > Database Configuration Validation > should warn about service role key security 1ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > External Integrations Validation > should validate N8N webhook URL format 1ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > External Integrations Validation > should require HTTPS for production webhooks 1ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > External Integrations Validation > should warn about missing webhook secret 1ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > External Integrations Validation > should warn about weak webhook secrets 1ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > Security Configuration Validation > should prevent debug tools in production 1ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > Security Configuration Validation > should prevent mock responses in production 1ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > Security Configuration Validation > should prevent auth bypass outside development 0ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > Security Configuration Validation > should warn about missing CSP in production 1ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > Performance Configuration Validation > should validate cache TTL values 1ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > Performance Configuration Validation > should validate rate limiting configuration 1ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > Performance Configuration Validation > should validate webhook performance settings 5ms
     → expected false to be true // Object.is equality
   × Enhanced Environment Validation > Production Readiness > should identify production-ready configuration 1ms
     → expected false to be true // Object.is equality
   ✓ Enhanced Environment Validation > Production Readiness > should identify non-production-ready configuration 0ms
   × Enhanced Environment Validation > Health Check Status > should return healthy status for valid configuration 2ms
     → expected 'error' to be 'healthy' // Object.is equality
   ✓ Enhanced Environment Validation > Health Check Status > should return error status for invalid configuration 0ms
   ✓ Enhanced Environment Validation > Health Check Status > should include metrics in health status 0ms
   × Enhanced Environment Validation > Environment Info > should return comprehensive environment information 1ms
     → expected { isProduction: false, …(24) } to have property "isValid" with value true
   ✓ Enhanced Environment Validation > Logging > should log environment status without errors 1ms
   ✓ Enhanced Environment Validation > Cross-Environment Validation > should handle development environment specifics 0ms
   ✓ Enhanced Environment Validation > Cross-Environment Validation > should handle staging environment specifics 0ms
   × Enhanced Environment Validation > Cross-Environment Validation > should handle production environment specifics 1ms
     → expected false to be true // Object.is equality
 ❯ src/lib/__tests__/environment-integration.test.ts (15 tests | 10 failed) 32ms
   × Environment & Secrets Integration > Complete Development Environment > should validate complete development setup 14ms
     → expected false to be true // Object.is equality
   ✓ Environment & Secrets Integration > Complete Development Environment > should allow insecure configurations in development 1ms
   × Environment & Secrets Integration > Complete Staging Environment > should validate complete staging setup 2ms
     → expected false to be true // Object.is equality
   ✓ Environment & Secrets Integration > Complete Staging Environment > should enforce HTTPS in staging 0ms
   × Environment & Secrets Integration > Complete Production Environment > should validate complete production setup 1ms
     → expected false to be true // Object.is equality
   ✓ Environment & Secrets Integration > Complete Production Environment > should reject insecure production configurations 1ms
   × Environment & Secrets Integration > Complete Production Environment > should require HTTPS for all external services in production 1ms
     → expected false to be true // Object.is equality
   × Environment & Secrets Integration > Health Check Integration > should provide comprehensive health status 3ms
     → expected 'error' to be 'healthy' // Object.is equality
   ✓ Environment & Secrets Integration > Health Check Integration > should detect configuration problems in health checks 1ms
   × Environment & Secrets Integration > Production Readiness Assessment > should correctly assess production readiness 1ms
     → expected false to be true // Object.is equality
   ✓ Environment & Secrets Integration > Production Readiness Assessment > should reject non-production-ready configuration 0ms
   × Environment & Secrets Integration > Cross-System Dependencies > should validate database and webhook integration 1ms
     → expected undefined to be defined
   × Environment & Secrets Integration > Cross-System Dependencies > should validate monitoring integration 1ms
     → expected undefined to be defined
   × Environment & Secrets Integration > Error Correlation > should correlate related errors across systems 1ms
     → expected false to be true // Object.is equality
   × Environment & Secrets Integration > Complete System Validation > should validate entire system health 1ms
     → expected false to be true // Object.is equality
 ❯ src/lib/__tests__/secrets-management.test.ts (27 tests | 27 failed) 22ms
   × Secrets Management System > Secret Strength Assessment > should identify strong secrets 6ms
     → secretsManager is not defined
   × Secrets Management System > Secret Strength Assessment > should identify medium strength secrets 1ms
     → secretsManager is not defined
   × Secrets Management System > Secret Strength Assessment > should identify weak secrets 0ms
     → secretsManager is not defined
   × Secrets Management System > Secret Strength Assessment > should identify empty secrets as weak 0ms
     → secretsManager is not defined
   × Secrets Management System > Required Secrets Validation > should require Supabase URL and key 0ms
     → secretsManager is not defined
   × Secrets Management System > Required Secrets Validation > should require webhook secret in production 0ms
     → secretsManager is not defined
   × Secrets Management System > Required Secrets Validation > should require security secrets in production 0ms
     → secretsManager is not defined
   × Secrets Management System > Required Secrets Validation > should not require monitoring secrets in development 1ms
     → secretsManager is not defined
   × Secrets Management System > Security Validation > should detect weak security secrets as errors 1ms
     → secretsManager is not defined
   × Secrets Management System > Security Validation > should warn about client-exposed security secrets 0ms
     → secretsManager is not defined
   × Secrets Management System > Security Validation > should warn about service role key exposure 0ms
     → secretsManager is not defined
   × Secrets Management System > Security Validation > should detect default values in production 0ms
     → secretsManager is not defined
   × Secrets Management System > Security Validation > should detect development URLs in production 0ms
     → secretsManager is not defined
   × Secrets Management System > Secret Categorization > should categorize secrets correctly 0ms
     → secretsManager is not defined
   × Secrets Management System > Secret Access Logging > should log secret access 0ms
     → secretsManager is not defined
   × Secrets Management System > Secret Access Logging > should limit audit log size 0ms
     → secretsManager is not defined
   × Secrets Management System > Rotation Status > should track rotation status 0ms
     → secretsManager is not defined
   × Secrets Management System > Rotation Status > should identify overdue rotations 0ms
     → secretsManager is not defined
   × Secrets Management System > Rotation Status > should identify upcoming rotation needs 0ms
     → secretsManager is not defined
   × Secrets Management System > Summary Generation > should generate accurate summary 5ms
     → secretsManager is not defined
   × Secrets Management System > Health Status > should return healthy status for good configuration 0ms
     → secretsManager is not defined
   × Secrets Management System > Health Status > should return warning status for issues 0ms
     → secretsManager is not defined
   × Secrets Management System > Health Status > should include rotation status in health check 0ms
     → secretsManager is not defined
   × Secrets Management System > Environment-Specific Validation > should be more permissive in development 0ms
     → secretsManager is not defined
   × Secrets Management System > Environment-Specific Validation > should be strict in production 0ms
     → secretsManager is not defined
   × Secrets Management System > Logging > should log secrets status without revealing values 0ms
     → secretsManager is not defined
   × Secrets Management System > Integration with Environment Validation > should complement environment validation 0ms
     → secretsManager is not defined
stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Message Sending Success Scenarios > should send message successfully with valid payload
Webhook attempt 1 failed, retrying in 100ms: Network error: response.text is not a function

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Message Sending Success Scenarios > should send message successfully with valid payload
Webhook attempt 2 failed, retrying in 200ms: Network error: Cannot read properties of undefined (reading 'ok')

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Message Sending Success Scenarios > should include request metadata in payload
Webhook attempt 1 failed, retrying in 100ms: Network error: response.text is not a function

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Message Sending Success Scenarios > should include request metadata in payload
Webhook attempt 2 failed, retrying in 200ms: Network error: Cannot read properties of undefined (reading 'ok')

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle HTTP error responses
Webhook attempt 1 failed, retrying in 100ms: HTTP 500: Internal Server Error

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle HTTP error responses
Webhook attempt 2 failed, retrying in 200ms: HTTP 500: Internal Server Error

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle network errors
Webhook attempt 1 failed, retrying in 100ms: Network error: Failed to fetch

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle network errors
Webhook attempt 2 failed, retrying in 200ms: Network error: Failed to fetch

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle malformed response format
Webhook attempt 1 failed, retrying in 100ms: Network error: response.text is not a function

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle malformed response format
Webhook attempt 2 failed, retrying in 200ms: Network error: Failed to fetch

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Basic Retry Logic > should retry on retryable errors and eventually succeed
Webhook attempt 1 failed, retrying in 100ms: Network error: Network error

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Basic Retry Logic > should retry on retryable errors and eventually succeed
Webhook attempt 2 failed, retrying in 200ms: Network error: Network error

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Webhook Payload Validation > should validate required payload fields
Webhook attempt 1 failed, retrying in 100ms: Network error: response.text is not a function

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Webhook Payload Validation > should validate required payload fields
Webhook attempt 2 failed, retrying in 200ms: Network error: Failed to fetch

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Webhook Payload Validation > should include optional payload fields when provided
Webhook attempt 1 failed, retrying in 100ms: Network error: response.text is not a function

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Webhook Payload Validation > should include optional payload fields when provided
Webhook attempt 2 failed, retrying in 200ms: Network error: Failed to fetch

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Performance and Metrics > should track request metrics on success
Webhook attempt 1 failed, retrying in 100ms: Network error: response.text is not a function

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Performance and Metrics > should track request metrics on success
Webhook attempt 2 failed, retrying in 200ms: Network error: Failed to fetch

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Performance and Metrics > should track error metrics on failures
Webhook attempt 1 failed, retrying in 100ms: Network error: Network error

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Performance and Metrics > should track error metrics on failures
Webhook attempt 2 failed, retrying in 200ms: Network error: Failed to fetch

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Health Check > should perform health check successfully
Webhook attempt 1 failed, retrying in 100ms: Network error: response.text is not a function

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Health Check > should perform health check successfully
Webhook attempt 2 failed, retrying in 200ms: Network error: Failed to fetch

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Health Check > should return unhealthy status on errors
Webhook attempt 1 failed, retrying in 100ms: Network error: Connection failed

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Health Check > should return unhealthy status on errors
Webhook attempt 2 failed, retrying in 200ms: Network error: Failed to fetch

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Configuration and Security > should include standard headers in all requests
Webhook attempt 1 failed, retrying in 100ms: Network error: response.text is not a function

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Configuration and Security > should include standard headers in all requests
Webhook attempt 2 failed, retrying in 200ms: Network error: Failed to fetch

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Configuration and Security > should generate unique request IDs
Webhook attempt 1 failed, retrying in 100ms: Network error: response.text is not a function

stderr | src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Configuration and Security > should generate unique request IDs
Webhook attempt 2 failed, retrying in 200ms: Network error: response.text is not a function

 ❯ src/lib/__tests__/webhookService.basic.test.ts (18 tests | 10 failed) 4252ms
   × WebhookService - Basic Tests > Message Sending Success Scenarios > should send message successfully with valid payload 314ms
     → Network error: Cannot read properties of undefined (reading 'ok')
   × WebhookService - Basic Tests > Message Sending Success Scenarios > should include request metadata in payload 303ms
     → Network error: Cannot read properties of undefined (reading 'ok')
   ✓ WebhookService - Basic Tests > Error Handling > should throw validation error for missing webhook URL 2ms
   ✓ WebhookService - Basic Tests > Error Handling > should handle HTTP error responses  301ms
   ✓ WebhookService - Basic Tests > Error Handling > should handle network errors  302ms
   × WebhookService - Basic Tests > Error Handling > should handle malformed response format 307ms
     → expected error to match asymmetric matcher
   × WebhookService - Basic Tests > Basic Retry Logic > should retry on retryable errors and eventually succeed 302ms
     → Network error: response.text is not a function
   ✓ WebhookService - Basic Tests > Basic Retry Logic > should not retry on non-retryable errors 1ms
   × WebhookService - Basic Tests > Webhook Payload Validation > should validate required payload fields 303ms
     → Network error: Failed to fetch
   × WebhookService - Basic Tests > Webhook Payload Validation > should include optional payload fields when provided 303ms
     → Network error: Failed to fetch
   × WebhookService - Basic Tests > Performance and Metrics > should track request metrics on success 301ms
     → Network error: Failed to fetch
   ✓ WebhookService - Basic Tests > Performance and Metrics > should track error metrics on failures  301ms
   × WebhookService - Basic Tests > Health Check > should perform health check successfully 302ms
     → expected 'unhealthy' to be 'healthy' // Object.is equality
   ✓ WebhookService - Basic Tests > Health Check > should return unhealthy status on errors  302ms
   × WebhookService - Basic Tests > Configuration and Security > should include standard headers in all requests 302ms
     → Network error: Failed to fetch
   × WebhookService - Basic Tests > Configuration and Security > should generate unique request IDs 303ms
     → Network error: response.text is not a function
   ✓ WebhookService - Basic Tests > Configuration and Security > should provide circuit breaker configuration methods 1ms
   ✓ WebhookService - Basic Tests > Configuration and Security > should allow manual circuit breaker reset 0ms
 ❯ src/lib/__tests__/config-templates.test.ts (14 tests | 12 failed) 29ms
   ✓ Configuration Templates Validation > Environment Template Files > should have .env.template for development 2ms
   × Configuration Templates Validation > Environment Template Files > should have .env.staging.template for staging 8ms
     → expected [Function] to not throw an error but 'Error: ENOENT: no such file or direct…' was thrown
   × Configuration Templates Validation > Environment Template Files > should have .env.production.template for production 1ms
     → expected [Function] to not throw an error but 'Error: ENOENT: no such file or direct…' was thrown
   × Configuration Templates Validation > Template Content Validation > should include all required variables in development template 10ms
     → expected '# ===================================…' to contain 'VITE_APP_ENV='
   × Configuration Templates Validation > Template Content Validation > should include production-specific variables in production template 1ms
     → ENOENT: no such file or directory, open '/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/.env.production.template'
   × Configuration Templates Validation > Template Content Validation > should include staging-specific variables in staging template 0ms
     → ENOENT: no such file or directory, open '/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/.env.staging.template'
   × Configuration Templates Validation > Security Annotations > should have security warnings in all templates 1ms
     → expected '# ===================================…' to match /service.*role.*key.*server.*only/i
   × Configuration Templates Validation > Security Annotations > should mark sensitive variables appropriately 0ms
     → ENOENT: no such file or directory, open '/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/.env.production.template'
   × Configuration Templates Validation > Template Format Validation > should use proper environment variable format 1ms
     → ENOENT: no such file or directory, open '/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/.env.staging.template'
   ✓ Configuration Templates Validation > Template Format Validation > should have consistent variable naming 1ms
   × Configuration Templates Validation > Template Completeness > should cover all configuration categories 0ms
     → ENOENT: no such file or directory, open '/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/.env.production.template'
   × Configuration Templates Validation > Template Completeness > should provide example values where appropriate 1ms
     → expected 'VITE_APP_DOMAIN=http://69.62.71.229:3…' to match /=.*localhost.*:|=.*example\.com/
   × Configuration Templates Validation > Environment-Specific Differences > should have appropriate differences between environments 0ms
     → ENOENT: no such file or directory, open '/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/.env.staging.template'
   × Configuration Templates Validation > Documentation Quality > should have comprehensive comments 1ms
     → expected '# ===================================…' to match /#.*Application.*Settings/i
 ❯ src/lib/__tests__/monitoring.test.ts (22 tests | 6 failed) 5037ms
   ✓ MonitoringService > Performance Tracking > should track page load time 3ms
   ✓ MonitoringService > Performance Tracking > should track API response times 1ms
   × MonitoringService > Performance Tracking > should track API errors for 4xx/5xx status codes 9ms
     → expected [ …(2) ] to have a length of 1 but got 2
   ✓ MonitoringService > Performance Tracking > should track user interactions 1ms
   ✓ MonitoringService > Custom Metrics > should track custom metrics with tags 0ms
   ✓ MonitoringService > Custom Metrics > should track business events 0ms
   ✓ MonitoringService > User Tracking > should set user information 0ms
   × MonitoringService > Transactions > should create and finish transactions 1ms
     → expected 1753589847566 to be greater than 1753589847566
   × MonitoringService > Transactions > should track transaction duration as metric 1ms
     → Timers are not mocked. Try calling "vi.useFakeTimers()" first.
   ✓ MonitoringService > Error Tracking > should capture exceptions 1ms
   ✓ MonitoringService > Error Tracking > should capture messages with different levels 0ms
   × MonitoringService > Core Web Vitals > should collect Core Web Vitals 5002ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   ✓ MonitoringService > Metrics Filtering > should filter metrics by name 1ms
   ✓ MonitoringService > Metrics Filtering > should filter metrics by time range 1ms
   ✓ MonitoringService > Health Monitoring > should report monitoring health status 1ms
   ✓ MonitoringService > Health Monitoring > should report degraded status with many errors 0ms
   ✓ MonitoringService > External Integration > should handle missing external APM services gracefully 1ms
   ✓ MonitoringService > External Integration > should send to external services when available 1ms
   ✓ MonitoringService > Memory Management > should limit metrics storage to prevent memory leaks 6ms
   ✓ MonitoringService > Memory Management > should limit events storage to prevent memory leaks 3ms
   × MonitoringService > Performance Wrapper > should wrap functions with monitoring 1ms
     → monitoringService.withMonitoring is not a function
   × MonitoringService > Performance Wrapper > should handle function errors and track them 1ms
     → monitoringService.withMonitoring is not a function
stderr | src/lib/__tests__/chatService.enhanced.test.ts
N8N webhook URL not configured. Using fallback responses.

stdout | src/hooks/__tests__/useTools.test.ts > useTools > tool selection > should toggle tool selection correctly
Tool usage recorded: {
  toolId: 'web_search',
  toolName: 'Web Search',
  sessionId: 'session_1753589853368_gzl79xmll'
}

stdout | src/hooks/__tests__/useTools.test.ts > useTools > tool selection > should save selections to localStorage when changed
Tool usage recorded: {
  toolId: 'web_search',
  toolName: 'Web Search',
  sessionId: 'session_1753589853375_7g0qkk9cb'
}

stdout | src/hooks/__tests__/useTools.test.ts > useTools > getSelectedToolIds > should return only enabled tool IDs
Tool usage recorded: {
  toolId: 'web_search',
  toolName: 'Web Search',
  sessionId: 'session_1753589853380_t1ux9hzey'
}

stdout | src/hooks/__tests__/useTools.test.ts > useTools > resetToDefaults > should reset to default selections and preferences
Tool usage recorded: {
  toolId: 'web_search',
  toolName: 'Web Search',
  sessionId: 'session_1753589853387_1ar2xga4j'
}

stderr | src/hooks/__tests__/useTools.test.ts > useTools > error handling > should handle localStorage errors gracefully
Error loading tool preferences: Error: localStorage error
    at Object.<anonymous> (/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/hooks/__tests__/useTools.test.ts:240:15)
    at Object.mockCall (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/spy/dist/index.js:96:15)
    at Object.spy [as getItem] (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/tinyspy/dist/index.js:47:103)
    at loadUserPreferences (/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/hooks/useTools.ts:62:46)
    at /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/hooks/useTools.ts:97:5
    at Object.react-stack-bottom-frame (/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/react-dom/cjs/react-dom-client.development.js:23949:20)
    at runWithFiberInDEV (/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
    at commitHookEffectListMount (/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/react-dom/cjs/react-dom-client.development.js:11905:29)
    at commitHookPassiveMountEffects (/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/react-dom/cjs/react-dom-client.development.js:12028:11)
    at commitPassiveMountOnFiber (/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/react-dom/cjs/react-dom-client.development.js:13841:13)

 ✓ src/hooks/__tests__/useTools.test.ts (10 tests) 60ms
stdout | src/lib/__tests__/webhook.diagnostic.test.ts > Webhook Diagnostics > should diagnose webhook connectivity and provide setup guidance

🔍 WEBHOOK DIAGNOSTIC REPORT
══════════════════════════════════════════════════
📡 Testing webhook: https://n8n.madpanda3d.com/webhook-test/4bed7e4e-041a-4f19-b736-d320250a50ca

stdout | src/lib/__tests__/webhook.diagnostic.test.ts > Webhook Diagnostics > should diagnose webhook connectivity and provide setup guidance
❌ WEBHOOK ERROR DETECTED
   Error Type: http_error
   Status Code: 404
   Message: n8n Webhook Error: The requested webhook "4bed7e4e-041a-4f19-b736-d320250a50ca" is not registered.. Click the 'Execute workflow' button on the canvas, then try again. (In test mode, the webhook only works for one call after you click this button)

💡 SOLUTION FOR 404 ERROR:
   Your n8n workflow is in TEST MODE.
   To fix this:
   1. Go to your n8n workflow editor
   2. Click the "Execute Workflow" button
   3. OR activate the workflow for production use
   4. Then re-run this test

   Alternative: Use production webhook URL instead of test URL

🌐 Testing basic connectivity...

stdout | src/lib/__tests__/webhook.diagnostic.test.ts > Webhook Diagnostics > should diagnose webhook connectivity and provide setup guidance
   Server responds: 404 Not Found

⚙️  CURRENT CONFIGURATION:
   Webhook URL: https://n8n.madpanda3d.com/webhook-test/4bed7e4e-041a-4f19-b736-d320250a50ca
   Timeout: 5000ms
   Max Retries: 1
   Circuit Breaker Threshold: 5

📊 METRICS:
   Total Requests: 1
   Successful: 0
   Failed: 1
   Error Rate: 100.00%
   Circuit State: closed

🔧 NEXT STEPS:
   1. Activate your n8n workflow
   2. Consider using production webhook URL
   3. Test with curl first: curl -X POST [webhook-url] -H "Content-Type: application/json" -d '{"message":"test"}'
   4. Check n8n logs for any processing errors

═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═
═

stdout | src/lib/__tests__/webhook.diagnostic.test.ts > Webhook Diagnostics > should test webhook response format expectations

📋 WEBHOOK RESPONSE FORMAT REQUIREMENTS
════════════════════════════════════════
For successful integration, your n8n webhook should return:
```json
{
  "response": "Your AI response message here",
  "success": true,
  "requestId": "optional-request-id",
  "processingTime": 150 // optional, in ms
}
```

For error responses:
```json
{
  "response": "",
  "success": false,
  "error": "Description of what went wrong"
}
```

📨 INPUT PAYLOAD FORMAT:
Your n8n workflow will receive:
```json
{
  "message": "User message text",
  "userId": "unique_user_identifier", 
  "timestamp": "2025-01-24T13:10:00.000Z",
  "conversationId": "optional_conversation_id",
  "requestId": "req_1234567890_abcdef123",
  "clientVersion": "1.0.0",
  "metadata": {
    "source": "chat_interface",
    "additionalContext": "..."
  }
}
```

stdout | src/lib/__tests__/webhook.diagnostic.test.ts > Webhook Diagnostics > should provide n8n workflow setup guidance

🛠️  N8N WORKFLOW SETUP GUIDE
════════════════════════════════════════
1. WEBHOOK NODE SETUP:
   • Method: POST
   • Path: /webhook-test/4bed7e4e-041a-4f19-b736-d320250a50ca
   • Response Mode: "Respond to Webhook"
   • Authentication: None (or *** if needed)

2. PROCESS THE REQUEST:
   • Extract message: {{ $json.message }}
   • Extract userId: {{ $json.userId }}
   • Extract conversationId: {{ $json.conversationId }}

3. AI PROCESSING:
   • Connect to your AI service (OpenAI, Claude, etc.)
   • Use the message as prompt
   • Consider conversation context if needed

4. RESPONSE NODE SETUP:
   • Use "Respond to Webhook" node
   • Response Body:
     {
       "response": "{{ $json.ai_response }}",
       "success": true,
       "requestId": "{{ $json.requestId }}",
       "processingTime": {{ $json.processing_time }}
     }

5. ERROR HANDLING:
   • Add error handling nodes
   • Return error response format on failures
   • Log errors for debugging

6. ACTIVATION:
   • Click "Execute Workflow" for testing
   • Set to "Active" for production use
   • Monitor execution logs

 ✓ src/lib/__tests__/webhook.diagnostic.test.ts (3 tests) 397ms
   ✓ Webhook Diagnostics > should diagnose webhook connectivity and provide setup guidance  393ms
 ✓ src/lib/__tests__/env-validation.test.ts (7 tests) 9ms
stdout | src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle beforeinstallprompt event
📱 PWA install prompt available

stdout | src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle successful installation
📱 PWA install prompt available

stdout | src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle successful installation
👤 User choice: accepted
✅ User accepted the install prompt

stdout | src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle installation rejection
📱 PWA install prompt available

stdout | src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle installation rejection
👤 User choice: dismissed
❌ User dismissed the install prompt

stdout | src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle installation error
📱 PWA install prompt available

stderr | src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle installation error
❌ Install failed: Error: Installation failed
    at /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/hooks/__tests__/usePWAInstall.test.ts:153:50
    at file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11
    at file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:752:26
    at file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20
    at new Promise (<anonymous>)
    at runWithTimeout (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1863:10)
    at runTest (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1574:12)
    at runSuite (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)
    at runSuite (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)
    at runFiles (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1787:3)

stdout | src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle appinstalled event
📱 PWA install prompt available
✅ PWA was installed

stdout | src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should clear error when clearError is called
📱 PWA install prompt available

 ✓ src/hooks/__tests__/usePWAInstall.test.ts (9 tests) 45ms
 ❯ src/lib/__tests__/webhook.integration.test.ts (5 tests | 5 failed) 3026ms
   × Real n8n Webhook Integration > should successfully send message to real n8n webhook 573ms
     → Webhook returned empty response. Check that your n8n workflow has a "Respond to Webhook" node configured to return JSON.
   × Real n8n Webhook Integration > should perform health check successfully 2239ms
     → actual value must be number or bigint, received "undefined"
   × Real n8n Webhook Integration > should handle conversation context properly 98ms
     → Webhook returned empty response. Check that your n8n workflow has a "Respond to Webhook" node configured to return JSON.
   × Real n8n Webhook Integration > should demonstrate error recovery and circuit breaker 4ms
     → expected 'https://n8n.madpanda3d.com/webhook/4b…' to be 'https://n8n.madpanda3d.com/webhook-te…' // Object.is equality
   × Real n8n Webhook Integration > should test different message types and formats 110ms
     → Webhook returned empty response. Check that your n8n workflow has a "Respond to Webhook" node configured to return JSON.
stderr | src/hooks/__tests__/useChat.test.ts > useChat > should handle send message error
Failed to send message: Error: Network error
    at /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/hooks/__tests__/useChat.test.ts:140:7
    at file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11
    at file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:752:26
    at file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20
    at new Promise (<anonymous>)
    at runWithTimeout (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1863:10)
    at runTest (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1574:12)
    at runSuite (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)
    at runSuite (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)
    at runFiles (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1787:3)

stderr | src/hooks/__tests__/useChat.test.ts > useChat > should clear messages
An update to TestComponent inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act
An update to TestComponent inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

stderr | src/hooks/__tests__/useChat.test.ts > useChat > should clear error
An update to TestComponent inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act
An update to TestComponent inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

 ❯ src/hooks/__tests__/useChat.test.ts (7 tests | 2 failed) 95ms
   ✓ useChat > should initialize with empty state 14ms
   ✓ useChat > should load message history when user logs in 55ms
   × useChat > should handle send message successfully 10ms
     → expected "spy" to be called with arguments: [ 'Hello', 'test-user-id' ]

Received: 

  1st spy call:

  [
    "Hello",
    "test-user-id",
+   undefined,
+   undefined,
  ]


Number of calls: 1

   × useChat > should handle send message error 7ms
     → expected [ { id: 'error-1753589861138', …(4) } ] to have a length of 2 but got 1
   ✓ useChat > should not send empty messages 2ms
   ✓ useChat > should clear messages 2ms
   ✓ useChat > should clear error 2ms
 ❯ src/components/pwa/__tests__/PWAStatus.test.tsx (9 tests | 2 failed) 88ms
   ✓ PWAStatus > should show "Installed" badge when app is installed 44ms
   ✓ PWAStatus > should show "Installed" badge when in standalone mode 5ms
   × PWAStatus > should show "Web App" badge when PWA is supported but not installed 10ms
     → Unable to find an element with the text: Web App. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="flex items-center gap-2 "
    >
      <div
        class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-primary/10 text-primary"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-smartphone w-3 h-3 mr-1"
          fill="none"
          height="24"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            height="20"
            rx="2"
            ry="2"
            width="14"
            x="5"
            y="2"
          />
          <path
            d="M12 18h.01"
          />
        </svg>
        Installed
      </div>
    </div>
  </div>
</body>
   × PWAStatus > should show "Browser" badge when PWA is not supported 4ms
     → Unable to find an element with the text: Browser. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="flex items-center gap-2 "
    >
      <div
        class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-primary/10 text-primary"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-smartphone w-3 h-3 mr-1"
          fill="none"
          height="24"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            height="20"
            rx="2"
            ry="2"
            width="14"
            x="5"
            y="2"
          />
          <path
            d="M12 18h.01"
          />
        </svg>
        Installed
      </div>
    </div>
  </div>
</body>
   ✓ PWAStatus > should show install button when canInstall is true and showInstallButton is true 5ms
   ✓ PWAStatus > should not show install button when showInstallButton is false 3ms
   ✓ PWAStatus > should call install when install button is clicked 7ms
   ✓ PWAStatus > should show "Installing..." when isInstalling is true 3ms
   ✓ PWAStatus > should show "Install App" on mobile devices 4ms
 ✓ scripts/__tests__/webhook-server.test.js (8 tests) 5ms
stderr | src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should call install when install button is clicked
An update to InstallPrompt inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

 ✓ src/components/pwa/__tests__/InstallPrompt.test.tsx (8 tests) 257ms
stderr | src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Webhook Status Monitoring > should handle health check errors gracefully
Error getting webhook status: Error: Health check failed
    at /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/lib/__tests__/chatService.enhanced.test.ts:265:9
    at file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11
    at file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:752:26
    at file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20
    at new Promise (<anonymous>)
    at runWithTimeout (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1863:10)
    at runTest (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1574:12)
    at runSuite (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)
    at runSuite (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)
    at runSuite (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)

 ❯ src/lib/__tests__/chatService.enhanced.test.ts (11 tests | 6 failed) 13712ms
   × ChatService - Enhanced Integration > Enhanced sendMessageToAI > should use webhook service with proper payload structure 2604ms
     → expected 'I understand you said: "Hello". I\'m …' to be 'AI response from webhook service' // Object.is equality
   × ChatService - Enhanced Integration > Enhanced sendMessageToAI > should handle webhook service errors gracefully 2536ms
     → promise resolved "'That\'s an interesting point about "H…'" instead of rejecting
   ✓ ChatService - Enhanced Integration > Enhanced sendMessageToAI > should use fallback response when circuit breaker is open  2047ms
   ✓ ChatService - Enhanced Integration > Enhanced sendMessageToAI > should use fallback response when webhook URL not configured  1065ms
   × ChatService - Enhanced Integration > Enhanced sendMessageToAI > should include conversation ID in webhook payload when provided 1846ms
     → expected "spy" to be called with arguments: [ ObjectContaining{…} ]

Number of calls: 0

   × ChatService - Enhanced Integration > Enhanced sendMessageToAI > should handle missing conversation ID gracefully 1265ms
     → expected "spy" to be called with arguments: [ ObjectContaining{…} ]

Number of calls: 0

   × ChatService - Enhanced Integration > Webhook Status Monitoring > should return webhook health status and metrics 4ms
     → expected { health: { …(2) }, …(2) } to deeply equal { health: { …(2) }, …(2) }
   ✓ ChatService - Enhanced Integration > Webhook Status Monitoring > should handle health check errors gracefully 3ms
   ✓ ChatService - Enhanced Integration > Webhook Status Monitoring > should detect when webhook is not configured 1ms
   ✓ ChatService - Enhanced Integration > Integration with Existing Features > should maintain backward compatibility with existing methods 0ms
   × ChatService - Enhanced Integration > Integration with Existing Features > should pass conversation ID to enhanced webhook service 2337ms
     → expected "spy" to be called with arguments: [ ObjectContaining{…} ]

Number of calls: 0

 ✓ src/components/auth/__tests__/AuthLayout.test.tsx (7 tests) 113ms
stderr | src/components/ui/__tests__/Avatar.test.tsx > Avatar > shows initials fallback on error
An update to Avatar inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act
An update to Avatar inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

 ✓ src/components/ui/__tests__/Avatar.test.tsx (5 tests) 99ms
 ✓ src/components/layout/__tests__/Footer.test.tsx (5 tests) 85ms
 ❯ src/lib/__tests__/webhookService.test.ts (34 tests | 29 failed) 140138ms
   × WebhookService > Message Sending Success Scenarios > should send message successfully with valid payload 5013ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Message Sending Success Scenarios > should include request metadata in payload 5001ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Message Sending Success Scenarios > should handle response with additional fields 5001ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   ✓ WebhookService > Error Handling > should throw validation error for missing webhook URL 2ms
   × WebhookService > Error Handling > should handle HTTP error responses 5002ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Error Handling > should handle network errors 5003ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Error Handling > should handle timeout errors 5001ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Error Handling > should handle malformed response format 5005ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Error Handling > should handle webhook response with success: false 5002ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Retry Logic with Exponential Backoff > should retry on retryable errors 5012ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   ✓ WebhookService > Retry Logic with Exponential Backoff > should not retry on non-retryable errors 2ms
   × WebhookService > Retry Logic with Exponential Backoff > should respect max retry attempts 5005ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Retry Logic with Exponential Backoff > should calculate exponential backoff delays 19ms
     → Aborting after running 10000 timers, assuming an infinite loop!
   ✓ WebhookService > Retry Logic with Exponential Backoff > should not retry on 4xx client errors (except 408, 429) 1ms
   × WebhookService > Retry Logic with Exponential Backoff > should retry on retryable HTTP status codes 5003ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Circuit Breaker Pattern > should open circuit after failure threshold 5001ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Circuit Breaker Pattern > should reset circuit breaker on successful request 5006ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   ✓ WebhookService > Circuit Breaker Pattern > should provide circuit breaker configuration methods 1ms
   ✓ WebhookService > Circuit Breaker Pattern > should allow manual circuit breaker reset 0ms
   × WebhookService > Webhook Payload Validation > should validate required payload fields 5001ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Webhook Payload Validation > should include optional payload fields when provided 5006ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Webhook Payload Validation > should validate webhook response format strictly 5001ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Performance and Metrics > should track request metrics 5007ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Performance and Metrics > should track error metrics on failures 5001ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Performance and Metrics > should calculate percentile response times 5005ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Performance and Metrics > should include last request timestamp in metrics 5001ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Health Check > should perform health check successfully 5006ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Health Check > should return degraded status for slow responses 5002ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Health Check > should return unhealthy status on errors 5007ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Concurrent Request Handling > should handle multiple concurrent requests 5002ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Concurrent Request Handling > should handle mixed success/failure in concurrent requests 5006ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Authentication and Security > should include authorization header when secret is provided 5001ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Authentication and Security > should include standard headers in all requests 5006ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
   × WebhookService > Authentication and Security > should generate unique request IDs 5002ms
     → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".

<--- Last few GCs --->

[2715:0x1aa5d570]   537921 ms: Mark-Compact 4052.6 (4131.7) -> 4037.0 (4132.2) MB, 2172.31 / 0.00 ms  (average mu = 0.146, current mu = 0.066) allocation failure; scavenge might not succeed
[2715:0x1aa5d570]   540142 ms: Mark-Compact 4053.1 (4132.2) -> 4037.5 (4132.7) MB, 1962.29 / 0.00 ms  (average mu = 0.132, current mu = 0.116) allocation failure; scavenge might not succeed


<--- JS stacktrace --->

FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
----- Native stack trace -----

 1: 0xb8cf03 node::OOMErrorHandler(char const*, v8::OOMDetails const&) [node (vitest 2)]
 2: 0xf060d0 v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, v8::OOMDetails const&) [node (vitest 2)]
 3: 0xf063b7 v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, v8::OOMDetails const&) [node (vitest 2)]
 4: 0x1118005  [node (vitest 2)]
 5: 0x1118594 v8::internal::Heap::RecomputeLimits(v8::internal::GarbageCollector) [node (vitest 2)]
 6: 0x112f484 v8::internal::Heap::PerformGarbageCollection(v8::internal::GarbageCollector, v8::internal::GarbageCollectionReason, char const*) [node (vitest 2)]
 7: 0x112fc9c v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags) [node (vitest 2)]
 8: 0x1105fa1 v8::internal::HeapAllocator::AllocateRawWithLightRetrySlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [node (vitest 2)]
 9: 0x1107135 v8::internal::HeapAllocator::AllocateRawWithRetryOrFailSlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [node (vitest 2)]
10: 0x10e4786 v8::internal::Factory::NewFillerObject(int, v8::internal::AllocationAlignment, v8::internal::AllocationType, v8::internal::AllocationOrigin) [node (vitest 2)]
11: 0x15402c6 v8::internal::Runtime_AllocateInYoungGeneration(int, unsigned long*, v8::internal::Isolate*) [node (vitest 2)]
12: 0x7faeb6e99ef6 

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
Error: Channel closed
 ❯ target.send node:internal/child_process:753:16
 ❯ ProcessWorker.send node_modules/tinypool/dist/index.js:140:41
 ❯ MessagePort.<anonymous> node_modules/tinypool/dist/index.js:149:62
 ❯ [nodejs.internal.kHybridDispatch] node:internal/event_target:831:20
 ❯ MessagePort.<anonymous> node:internal/per_context/messageport:23:28

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { code: 'ERR_IPC_CHANNEL_CLOSED' }



❌ Tests failed
🛑 Deployment cancelled due to test failures
Error: Process completed with exit code 1.