Run echo "🧪 Running test suite..."
🧪 Running test suite...

> jarvis-chat@0.0.0 test:ci
> NODE_OPTIONS='--max-old-space-size=4096' vitest run --pool=forks --poolOptions.forks.singleFork=true --reporter=verbose --bail=10


 RUN  v3.2.4 /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat

 ✓ src/lib/__tests__/bugLifecycleIntegration.test.ts > Bug Lifecycle Integration Tests > Complete Bug Lifecycle Workflow > processes complete bug lifecycle from open to closed 9ms
 ✓ src/lib/__tests__/bugLifecycleIntegration.test.ts > Bug Lifecycle Integration Tests > Complete Bug Lifecycle Workflow > handles escalation workflow correctly 1ms
 ✓ src/lib/__tests__/bugLifecycleIntegration.test.ts > Bug Lifecycle Integration Tests > Notification Integration > sends notifications throughout bug lifecycle 1ms
 ✓ src/lib/__tests__/bugLifecycleIntegration.test.ts > Bug Lifecycle Integration Tests > Notification Integration > respects user notification preferences 1ms
 ✓ src/lib/__tests__/bugLifecycleIntegration.test.ts > Bug Lifecycle Integration Tests > Communication and Collaboration > handles threaded discussions correctly 1ms
 ✓ src/lib/__tests__/bugLifecycleIntegration.test.ts > Bug Lifecycle Integration Tests > Communication and Collaboration > tracks audit trail for all activities 1ms
 ✓ src/lib/__tests__/bugLifecycleIntegration.test.ts > Bug Lifecycle Integration Tests > Feedback Integration > processes feedback lifecycle correctly 2ms
 ✓ src/lib/__tests__/bugLifecycleIntegration.test.ts > Bug Lifecycle Integration Tests > Performance and Scalability > handles concurrent operations efficiently 1ms
 ✓ src/lib/__tests__/bugLifecycleIntegration.test.ts > Bug Lifecycle Integration Tests > Performance and Scalability > maintains data consistency under load 1ms
 ✓ src/lib/__tests__/bugLifecycleIntegration.test.ts > Bug Lifecycle Integration Tests > Error Handling and Recovery > handles service failures gracefully 1ms
 ✓ src/lib/__tests__/bugLifecycleIntegration.test.ts > Bug Lifecycle Integration Tests > Error Handling and Recovery > validates state transitions correctly 1ms
 ✓ src/lib/__tests__/bugLifecycleIntegration.test.ts > Bug Lifecycle Integration Tests > Integration with Monitoring > tracks all lifecycle events for monitoring 3ms
 ✓ src/lib/__tests__/bugLifecycleIntegration.test.ts > Bug Lifecycle Integration Tests > Workflow Optimization > optimizes assignment recommendations based on workload 1ms
 ✓ src/lib/__tests__/bugLifecycleIntegration.test.ts > Bug Lifecycle Integration Tests > Workflow Optimization > provides workload balancing recommendations 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Message Sending Success Scenarios > should send message successfully with valid payload 7ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Message Sending Success Scenarios > should include request metadata in payload 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Message Sending Success Scenarios > should handle response with additional fields 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should throw validation error for missing webhook URL 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should handle HTTP error responses 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should handle network errors 1ms
(node:2277) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 4)
(Use `node --trace-warnings ...` to show where the warning was created)
(node:2277) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 11)
(node:2277) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 15)
(node:2277) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 19)
(node:2277) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 23)
(node:2277) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 28)
(node:2277) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 32)
(node:2277) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 34)
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should handle timeout errors 5ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should handle malformed response format 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should handle webhook response with success: false 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should retry on retryable errors with fake timer advancement 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should not retry on non-retryable errors 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should respect max attempts 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should calculate exponential backoff delays 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should not retry on 4xx client errors (except 408, 429) 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should retry on retryable HTTP status codes 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should open circuit after failure threshold with fake timers 4ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should reset circuit breaker on successful request 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should provide circuit breaker configuration methods 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should allow manual circuit breaker reset 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Webhook Payload Validation > should validate required payload fields 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Webhook Payload Validation > should include optional payload fields when provided 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Webhook Payload Validation > should validate webhook response format strictly 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Performance and Metrics > should track request metrics 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Performance and Metrics > should track error metrics on failures 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Performance and Metrics > should calculate percentile response times 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Performance and Metrics > should include last request timestamp in metrics 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Health Check > should perform health check successfully 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Health Check > should return unhealthy status on errors 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Concurrent Request Handling > should handle multiple concurrent requests 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Concurrent Request Handling > should handle mixed success/failure in concurrent requests 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Authentication and Security > should include authorization header when secret is provided 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Authentication and Security > should include standard headers in all requests 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Authentication and Security > should generate unique request IDs 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Timer Management and Cleanup > should not have pending timers after operation completion 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Timer Management and Cleanup > should clean up resources on destroy 1ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should create webhook configuration with admin permissions 23ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should return 401 for missing admin permissions 4ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should validate webhook configuration 10ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should support different authentication types 11ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should support event filtering 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform pattern analysis 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform resolution analysis 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform severity classification 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform duplicate detection 6ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform user impact analysis 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should return 400 for invalid analysis type 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should return 404 for non-existent bug 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should support analysis context options 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should setup Sentry integration with admin permissions 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should return 401 for missing admin permissions 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should validate Sentry configuration 4ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should handle connection test failures 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should setup DataDog integration with admin permissions 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should return 401 for missing admin permissions 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should validate DataDog configuration 4ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should support different DataDog sites 5ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > GET /api/integrations/:id/status > should return integration status 4ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > GET /api/integrations/:id/status > should return 404 for non-existent integration 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > GET /api/integrations > should list all integrations with summary 5ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should format bug data for Sentry correctly 1ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should format bug data for DataDog correctly 1ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should format bug data for Slack correctly 15ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should get delivery statistics 1ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Error Handling > should handle malformed webhook configurations 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Error Handling > should handle service unavailability gracefully 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should create export request with export permissions 6ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should return 401 for missing export permissions 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should validate export format 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should support all valid export formats 10ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should apply export templates 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should return 503 when export queue is full 12ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id > should return export status for valid export ID 6ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id > should return 404 for non-existent export ID 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id > should include progress for processing exports 105ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id/download > should download completed export file 507ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id/download > should return 400 for incomplete export 5ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should create scheduled export with admin permissions 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should return 401 for missing admin permissions 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should validate schedule configuration 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should support different schedule frequencies 5ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/templates > should return available export templates 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/templates > should filter templates by user access 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Export Processing > should handle large dataset exports 21ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Export Processing > should apply field selection correctly 206ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Export Processing > should handle export failures gracefully 207ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Custom Processing Options > should apply data anonymization when requested 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Custom Processing Options > should flatten nested objects when requested 3ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Payload Schema Validation > should validate a basic valid payload 3ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Payload Schema Validation > should validate payload with all optional fields 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Payload Schema Validation > should reject payload with missing required fields 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Payload Schema Validation > should reject payload with invalid field types 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Payload Schema Validation > should reject payload with extra unknown fields 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Payload Schema Validation > should validate message length constraints 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Payload Schema Validation > should validate all supported message types 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Payload Schema Validation > should validate all supported tool IDs 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Payload Schema Validation > should validate UUID format strictly 2ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Enhanced Webhook Payload Schema Validation > should validate enhanced payload with metadata 2ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Enhanced Webhook Payload Schema Validation > should apply default values for optional metadata fields 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Enhanced Webhook Payload Schema Validation > should validate tool selection metadata structure 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Response Schema Validation > should validate successful webhook response 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Response Schema Validation > should validate error webhook response 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Response Schema Validation > should reject response with invalid structure 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Response Schema Validation > should validate optional response fields 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Health Check Response Schema Validation > should validate healthy status response 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Health Check Response Schema Validation > should validate degraded status response 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Health Check Response Schema Validation > should reject invalid health status values 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Health Check Response Schema Validation > should validate minimal health check response 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Validation Error Schema > should create properly structured validation errors 2ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > WebhookValidator Utility Methods > should create validated payload with createValidatedPayload 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > WebhookValidator Utility Methods > should throw error for invalid payload construction 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > WebhookValidator Utility Methods > should provide validation summary 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > WebhookValidator Utility Methods > should provide detailed validation summary for invalid payload 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > WebhookValidator Utility Methods > should handle edge cases in validation summary 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Schema Integration Tests > should work with real-world payload example 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Schema Integration Tests > should handle complex validation error scenarios 1ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should return paginated bugs with valid API key 6ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should return 401 for invalid API key 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should return 401 for missing API key 5ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should apply status filters correctly 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should apply date range filters correctly 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should enforce pagination limits 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/:id > should return bug details with valid ID 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/:id > should return 404 for non-existent bug 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > PUT /api/bugs/:id/status > should update bug status with write permissions 4ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > PUT /api/bugs/:id/status > should return 400 for invalid status 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > PUT /api/bugs/:id/status > should return 401 for insufficient permissions 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/:id/assign > should assign bug with write permissions 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/:id/assign > should return 400 for failed assignment 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/search > should perform text search with results 5ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/search > should return empty results for no matches 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/analytics > should return analytics data 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/analytics > should use default time range when not specified 2ms
 ↓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Rate Limiting > should enforce rate limits
 ↓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Error Handling > should handle database errors gracefully
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Error Handling > should handle service errors gracefully 7ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Input Validation > should validate required fields for status updates 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Input Validation > should validate required fields for assignments 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Input Validation > should validate pagination parameters 3ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should record successful requests correctly 3ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should record failed requests correctly 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should calculate percentiles correctly 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should track requests per minute and hour 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should determine health status based on metrics 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should handle empty metrics gracefully 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should maintain performance history size limit 12ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should initialize with default alert rules 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should trigger high error rate alert 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should trigger slow response time alert 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should respect alert cooldown periods 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should allow custom alert rules 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should allow alert resolution 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should generate descriptive alert messages 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Dashboard Data > should generate comprehensive dashboard data 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Dashboard Data > should include performance trends in dashboard data 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Dashboard Data > should limit recent alerts in dashboard data 3ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert Subscription Management > should allow multiple subscribers 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert Subscription Management > should handle subscriber errors gracefully 3ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert Subscription Management > should properly unsubscribe callbacks 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Circuit Breaker Integration > should infer circuit breaker state from error patterns 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Circuit Breaker Integration > should detect half-open circuit breaker state 3ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Circuit Breaker Integration > should show closed circuit breaker for healthy patterns 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Data Cleanup and Management > should clear history and alerts properly 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Data Cleanup and Management > should handle concurrent request recording safely 3ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Singleton Instance > should provide working singleton instance 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Singleton Instance > should maintain state across singleton access 1ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > completes full bug report submission workflow 4ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > integrates error tracking with bug reports 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > integrates performance monitoring 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > handles validation errors properly 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > handles file upload failures gracefully 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > detects and prevents duplicate submissions 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > processes submission queue correctly 20ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > maintains data integrity throughout the process 4ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > handles system errors and recovers gracefully 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > generates proper tracking numbers 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > maintains performance under load 16ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > assigns bug to team member successfully 3ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > handles assignment to non-existent user 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > handles database update failures 4ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > tracks assignment history 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > handles reassignment correctly 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Auto Assignment > auto-assigns bug successfully 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Auto Assignment > returns null when no suitable assignee found 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Auto Assignment > considers workload when auto-assigning 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Recommendations > generates assignment recommendations 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Recommendations > sorts recommendations by confidence 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Recommendations > considers skill matching in recommendations 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Priority Escalation > escalates bug priority successfully 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Priority Escalation > prevents escalation beyond maximum priority 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Priority Escalation > sends escalation alerts to managers 3ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > calculates workload metrics correctly 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > identifies workload imbalances 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > updates team member information 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > handles update of non-existent team member 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Rules > applies assignment rules correctly 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Rules > falls back to recommendations when no rules match 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Error Handling > handles bug fetch errors gracefully 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Error Handling > handles notification failures gracefully 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Performance > handles concurrent assignments without conflicts 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Performance > maintains reasonable performance with large workload 2ms
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Application Configuration Validation > should validate application environment correctly
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Application Configuration Validation > should reject invalid environment values
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Application Configuration Validation > should warn about missing version in production
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Application Configuration Validation > should validate domain format
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Database Configuration Validation > should require Supabase URL and key
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Database Configuration Validation > should validate Supabase URL format
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Database Configuration Validation > should warn about short Supabase keys
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Database Configuration Validation > should warn about service role key security
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > External Integrations Validation > should validate N8N webhook URL format
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > External Integrations Validation > should require HTTPS for production webhooks
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > External Integrations Validation > should warn about missing webhook secret
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > External Integrations Validation > should warn about weak webhook secrets
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Security Configuration Validation > should prevent debug tools in production
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Security Configuration Validation > should prevent mock responses in production
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Security Configuration Validation > should prevent auth bypass outside development
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Security Configuration Validation > should warn about missing CSP in production
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Performance Configuration Validation > should validate cache TTL values
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Performance Configuration Validation > should validate rate limiting configuration
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Performance Configuration Validation > should validate webhook performance settings
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Production Readiness > should identify production-ready configuration
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Production Readiness > should identify non-production-ready configuration
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Health Check Status > should return healthy status for valid configuration
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Health Check Status > should return error status for invalid configuration
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Health Check Status > should include metrics in health status
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Environment Info > should return comprehensive environment information
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Logging > should log environment status without errors
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Cross-Environment Validation > should handle development environment specifics
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Cross-Environment Validation > should handle staging environment specifics
 ↓ src/lib/__tests__/env-validation.enhanced.test.ts > Enhanced Environment Validation > Cross-Environment Validation > should handle production environment specifics
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Development Environment > should validate complete development setup 4ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Development Environment > should allow insecure configurations in development 2ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Staging Environment > should validate complete staging setup 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Staging Environment > should enforce HTTPS in staging 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Production Environment > should validate complete production setup 2ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Production Environment > should reject insecure production configurations 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Production Environment > should require HTTPS for all external services in production 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Health Check Integration > should provide comprehensive health status 2ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Health Check Integration > should detect configuration problems in health checks 2ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Production Readiness Assessment > should correctly assess production readiness 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Production Readiness Assessment > should reject non-production-ready configuration 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Cross-System Dependencies > should validate database and webhook integration 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Cross-System Dependencies > should validate monitoring integration 2ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Error Correlation > should correlate related errors across systems 2ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete System Validation > should validate entire system health 3ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Secret Strength Assessment > should identify strong secrets 2ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Secret Strength Assessment > should identify medium strength secrets 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Secret Strength Assessment > should identify weak secrets 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Secret Strength Assessment > should identify empty secrets as weak 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Required Secrets Validation > should require Supabase URL and key 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Required Secrets Validation > should require webhook secret in production 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Required Secrets Validation > should require security secrets in production 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Required Secrets Validation > should not require monitoring secrets in development 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Security Validation > should detect weak security secrets as errors 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Security Validation > should warn about client-exposed security secrets 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Security Validation > should warn about service role key exposure 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Security Validation > should detect default values in production 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Security Validation > should detect development URLs in production 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Secret Categorization > should categorize secrets correctly 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Secret Access Logging > should log secret access 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Secret Access Logging > should limit audit log size 3ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Rotation Status > should track rotation status 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Rotation Status > should identify overdue rotations 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Rotation Status > should identify upcoming rotation needs 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Summary Generation > should generate accurate summary 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Health Status > should return healthy status for good configuration 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Health Status > should return warning status for issues 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Health Status > should include rotation status in health check 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Environment-Specific Validation > should be more permissive in development 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Environment-Specific Validation > should be strict in production 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Logging > should log secrets status without revealing values 2ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Integration with Environment Validation > should complement environment validation 1ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Tracking > should track page load time 4ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Tracking > should track API response times 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Tracking > should track API errors for 4xx/5xx status codes 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Tracking > should track user interactions 3ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Custom Metrics > should track custom metrics with tags 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Custom Metrics > should track business events 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > User Tracking > should set user information 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Transactions > should create and finish transactions 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Transactions > should track transaction duration as metric 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Error Tracking > should capture exceptions 3ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Error Tracking > should capture messages with different levels 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Core Web Vitals > should collect Core Web Vitals 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Metrics Filtering > should filter metrics by name 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Metrics Filtering > should filter metrics by time range 3ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Health Monitoring > should report monitoring health status 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Health Monitoring > should report degraded status with many errors 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > External Integration > should handle missing external APM services gracefully 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > External Integration > should send to external services when available 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Memory Management > should limit metrics storage to prevent memory leaks 9ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Memory Management > should limit events storage to prevent memory leaks 6ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Wrapper > should wrap functions with monitoring 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Wrapper > should handle function errors and track them 2ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Message Sending Success Scenarios > should send message successfully with valid payload 4ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Message Sending Success Scenarios > should include request metadata in payload 2ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should throw validation error for missing webhook URL 2ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle HTTP error responses 303ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle network errors 304ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle malformed response format 3ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Basic Retry Logic > should retry on retryable errors and eventually succeed 303ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Basic Retry Logic > should not retry on non-retryable errors 3ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Webhook Payload Validation > should validate required payload fields 2ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Webhook Payload Validation > should include optional payload fields when provided 2ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Performance and Metrics > should track request metrics on success 1ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Performance and Metrics > should track error metrics on failures 302ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Health Check > should perform health check successfully 4ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Health Check > should return unhealthy status on errors 302ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Configuration and Security > should include standard headers in all requests 3ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Configuration and Security > should generate unique request IDs 2ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Configuration and Security > should provide circuit breaker configuration methods 1ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Configuration and Security > should allow manual circuit breaker reset 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Enhanced Error Reports > should create enhanced error reports with session info 4ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Enhanced Error Reports > should generate fingerprints for error grouping 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Enhanced Error Reports > should include release and environment information 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Breadcrumb System > should add breadcrumbs with proper categorization 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Breadcrumb System > should limit breadcrumb storage 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Breadcrumb System > should include breadcrumbs in error reports 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > API Failure Tracking > should track API failures with detailed context 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > API Failure Tracking > should add breadcrumbs for API failures 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Authentication Error Tracking > should track auth errors with context 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Authentication Error Tracking > should add breadcrumbs for auth events 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > User Action Tracking > should track user actions as breadcrumbs 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > User Action Tracking > should handle different action types 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Tags Management > should set and retrieve tags 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Tags Management > should merge tags when setting multiple times 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Tags Management > should include tags in error reports 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Session Integration > should include session ID in error reports 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Session Integration > should set user context 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Performance > should handle high volume of errors efficiently 58ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Performance > should limit stored errors to prevent memory leaks 122ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Data Persistence > should persist errors to localStorage 3ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Data Persistence > should persist breadcrumbs to localStorage 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Data Persistence > should handle localStorage errors gracefully 3ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > External Monitoring Integration > should send errors to external monitoring asynchronously 27ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > External Monitoring Integration > should send breadcrumbs to external monitoring 14ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Environment Template Files > should have .env.template for development 3ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Environment Template Files > should have .env.staging.template for staging 2ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Environment Template Files > should have .env.production.template for production 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Template Content Validation > should include all required variables in development template 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Template Content Validation > should include production-specific variables in production template 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Template Content Validation > should include staging-specific variables in staging template 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Security Annotations > should have security warnings in all templates 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Security Annotations > should mark sensitive variables appropriately 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Template Format Validation > should use proper environment variable format 2ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Template Format Validation > should have consistent variable naming 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Template Completeness > should cover all configuration categories 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Template Completeness > should provide example values where appropriate 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Environment-Specific Differences > should have appropriate differences between environments 3ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Documentation Quality > should have comprehensive comments 2ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should use webhook service with proper payload structure 4ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should handle webhook service errors gracefully 2ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should use fallback response when circuit breaker is open 2834ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should use fallback response when webhook URL not configured 2863ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should include conversation ID in webhook payload when provided 4ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should handle missing conversation ID gracefully 2ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Webhook Status Monitoring > should return webhook health status and metrics 3ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Webhook Status Monitoring > should handle health check errors gracefully 1ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Webhook Status Monitoring > should detect when webhook is not configured 1ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Integration with Existing Features > should maintain backward compatibility with existing methods 1ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Integration with Existing Features > should pass conversation ID to enhanced webhook service 1ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > rendering > should render the tools button with correct selected count 43ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > rendering > should render compact version correctly 14ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > rendering > should show loading state 7ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > tool selection > should toggle tool selection when checkbox is clicked 34ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > tool selection > should display tools grouped by category 29ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > selected tools display > should show correct selected count in main label 16ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > selected tools display > should show "No tools selected" message when none are selected 22ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > tool information display > should display tool names and descriptions 32ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > tool information display > should show helpful message about tool usage 22ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > accessibility > should have proper aria-label for the main button 15ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > accessibility > should update aria-label when selection changes 13ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > error handling > should handle tools loading error gracefully 12ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > dropdown behavior > should open and close dropdown correctly 19ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > initialization > should initialize with default tools when user is not logged in 6ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > initialization > should load saved preferences from localStorage when user is logged in 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > tool selection > should toggle tool selection correctly 7ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > tool selection > should save selections to localStorage when changed 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > getSelectedToolIds > should return only enabled tool IDs 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > preferences management > should update preferences correctly 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > resetToDefaults > should reset to default selections and preferences 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > error handling > should handle localStorage errors gracefully 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > analytics > should generate session ID when recording usage 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > analytics > should not record usage when analytics is disabled 4ms
 ✓ src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > renders initial bug type selection step 14ms
 × src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > progresses through form steps correctly 11ms
   → Found multiple elements with the text: Report a Bug

Here are the matching elements:

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</body>
 × src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > validates required fields 9ms
   → Found multiple elements by: [data-testid="select-functionality-button"]

Here are the matching elements:

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
        <div
          class="mt-4 text-center"
        >
          <p
            class="text-xs text-gray-500"
          >
            Changes are being auto-saved...
          </p>
        </div>
      </div>
    </div>
  </div>
</body>
 × src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > handles form submission successfully 10ms
   → Found multiple elements with the text: Report a Bug

Here are the matching elements:

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
        <div
          class="mt-4 text-center"
        >
          <p
            class="text-xs text-gray-500"
          >
            Changes are being auto-saved...
          </p>
        </div>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</body>
 ✓ src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > displays success message after submission 4ms
 × src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > handles form cancellation 10ms
   → Found multiple elements by: [data-testid="select-functionality-button"]

Here are the matching elements:

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1...
 ✓ src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > supports auto-save functionality 9ms
 × src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > handles file attachment uploads 12ms
   → Found multiple elements with the text: Report a Bug

Here are the matching elements:

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1...
 ✓ src/lib/__tests__/webhook.diagnostic.test.ts > Webhook Diagnostics > should diagnose webhook connectivity and provide setup guidance 4ms
 ✓ src/lib/__tests__/webhook.diagnostic.test.ts > Webhook Diagnostics > should test webhook response format expectations 2ms
 ✓ src/lib/__tests__/webhook.diagnostic.test.ts > Webhook Diagnostics > should provide n8n workflow setup guidance 1ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Creation > should create a new session on initialization 6ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Creation > should generate unique session IDs 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Creation > should collect device information 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > User Management > should set user ID and metadata 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > User Management > should track auth events 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > User Management > should track failed auth events 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Analytics > should calculate session analytics 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Analytics > should track most visited pages 3ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session History > should maintain session history 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session History > should include current session in history 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Error Integration > should increment error count 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Data Persistence > should attempt to persist session data 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Data Persistence > should handle localStorage errors gracefully 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Performance > should limit session storage size 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Performance > should handle rapid user actions without performance issues 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Memory Management > should not leak memory with continuous usage 2ms
 ✓ src/lib/__tests__/env-validation.test.ts > Environment Validation > validateEnvironment > should return valid when all required variables are set 4ms
 ✓ src/lib/__tests__/env-validation.test.ts > Environment Validation > validateEnvironment > should return errors when required variables are missing 2ms
 ✓ src/lib/__tests__/env-validation.test.ts > Environment Validation > validateEnvironment > should validate URL format for Supabase URL 1ms
 ✓ src/lib/__tests__/env-validation.test.ts > Environment Validation > validateEnvironment > should validate JWT format for Supabase anon key 1ms
 ✓ src/lib/__tests__/env-validation.test.ts > Environment Validation > validateEnvironment > should add warnings for optional missing variables 1ms
 ✓ src/lib/__tests__/env-validation.test.ts > Environment Validation > getEnvironmentInfo > should return correct environment info structure 2ms
 ✓ src/lib/__tests__/env-validation.test.ts > Environment Validation > getEnvironmentInfo > should detect development environment 1ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > creates bug report successfully 7ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > collects enhanced error context 3ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > integrates with performance metrics 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > handles database submission errors 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > logs submission activity 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > handles missing browser info gracefully 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > correlates bug reports with errors 4ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > generates correlation IDs for tracking 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > handles network errors gracefully 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > collects comprehensive monitoring data 2ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should initialize with correct default state 6ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should detect when app is installed in standalone mode 3ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle beforeinstallprompt event 3ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle successful installation 3ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle installation rejection 5ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle installation error 3ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle appinstalled event 3ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should clear error when clearError is called 3ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should return false for install when no prompt is available 3ms
 × src/lib/__tests__/webhook.integration.test.ts > Real n8n Webhook Integration > should successfully send message to real n8n webhook 507ms
   → Unknown error during webhook call
 × src/lib/__tests__/webhook.integration.test.ts > Real n8n Webhook Integration > should perform health check successfully 507ms
   → actual value must be number or bigint, received "undefined"
 · src/lib/__tests__/webhook.integration.test.ts > Real n8n Webhook Integration > should handle conversation context properly
 · src/lib/__tests__/webhook.integration.test.ts > Real n8n Webhook Integration > should demonstrate error recovery and circuit breaker
 · src/lib/__tests__/webhook.integration.test.ts > Real n8n Webhook Integration > should test different message types and formats
 · src/hooks/__tests__/useChat.test.ts > useChat > should initialize with empty state
 · src/hooks/__tests__/useChat.test.ts > useChat > should load message history when user logs in
 · src/hooks/__tests__/useChat.test.ts > useChat > should handle send message successfully
 · src/hooks/__tests__/useChat.test.ts > useChat > should handle send message error
 · src/hooks/__tests__/useChat.test.ts > useChat > should not send empty messages
 · src/hooks/__tests__/useChat.test.ts > useChat > should clear messages
 · src/hooks/__tests__/useChat.test.ts > useChat > should clear error
 · src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should show "Installed" badge when app is installed
 · src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should show "Installed" badge when in standalone mode
 · src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should show "Web App" badge when PWA is supported but not installed
 · src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should show "Browser" badge when PWA is not supported
 · src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should show install button when canInstall is true and showInstallButton is true
 · src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should not show install button when showInstallButton is false
 · src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should call install when install button is clicked
 · src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should show "Installing..." when isInstalling is true
 · src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should show "Install App" on mobile devices
 · scripts/__tests__/webhook-server.test.js > Webhook Secret Synchronization Tests > should generate correct HMAC-SHA256 signature
 · scripts/__tests__/webhook-server.test.js > Webhook Secret Synchronization Tests > should verify GitHub webhook signature correctly
 · scripts/__tests__/webhook-server.test.js > Webhook Secret Synchronization Tests > should reject invalid webhook signature
 · scripts/__tests__/webhook-server.test.js > Webhook Secret Synchronization Tests > should handle missing signature gracefully
 · scripts/__tests__/webhook-server.test.js > Webhook Event Handler Tests > should handle ping event correctly
 · scripts/__tests__/webhook-server.test.js > Webhook Event Handler Tests > should handle workflow_run event correctly
 · scripts/__tests__/webhook-server.test.js > Environment Variable Tests > should load webhook secret from environment
 · scripts/__tests__/webhook-server.test.js > Environment Variable Tests > should use default value when environment variable not set
 · src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should not render when canInstall is false
 · src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should render install prompt when canInstall is true
 · src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should call install when install button is clicked
 · src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should show installing state when isInstalling is true
 · src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should display error message when installError is present
 · src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should dismiss prompt when X button is clicked
 · src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should respect showDelay prop
 · src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should hide prompt after successful installation
 · src/lib/__tests__/webhook.live.test.ts > Live Webhook Test > should test the actual n8n webhook with Hello JARVIS message
 · src/components/auth/__tests__/ProtectedRoute.test.tsx > ProtectedRoute > should show loading spinner when auth is not initialized
 · src/components/auth/__tests__/ProtectedRoute.test.tsx > ProtectedRoute > should show loading spinner when auth is loading
 · src/components/auth/__tests__/ProtectedRoute.test.tsx > ProtectedRoute > should render protected content when user is authenticated
 · src/components/auth/__tests__/ProtectedRoute.test.tsx > ProtectedRoute > should redirect to login when user is not authenticated
 · src/components/chat/__tests__/MessageSearch.test.tsx > MessageSearch > should validate test suite exists
 · src/lib/__tests__/chatService.production.test.ts > ChatService - Production Integration > should gracefully handle empty webhook responses with fallback
 · src/lib/__tests__/chatService.production.test.ts > ChatService - Production Integration > should provide webhook status diagnostics
 · src/lib/__tests__/chatService.production.test.ts > ChatService - Production Integration > should demonstrate conversation flow with fallback
 · src/lib/__tests__/webhookService.simple.test.ts > WebhookService Simple > should throw validation error for missing webhook URL
 · src/lib/__tests__/webhookService.simple.test.ts > WebhookService Simple > should handle HTTP 400 error without retries
 · src/test/setup.test.ts > Test Environment Setup > should have global error function available
 · src/test/setup.test.ts > Test Environment Setup > should have global BugStatus enum available
 · src/test/setup.test.ts > Test Environment Setup > should have global BugPriority enum available
 · src/test/setup.test.ts > Test Environment Setup > should have mocked console methods
 · src/test/setup.test.ts > Test Environment Setup > should have mocked browser APIs
 · src/test/setup.test.ts > Test Environment Setup > should have mocked storage APIs
 · src/test/setup.test.ts > Test Environment Setup > should have test environment variables set
 · src/components/auth/__tests__/AuthLayout.test.tsx > AuthLayout > renders default title "J.A.R.V.I.S OS"
 · src/components/auth/__tests__/AuthLayout.test.tsx > AuthLayout > renders custom title when provided
 · src/components/auth/__tests__/AuthLayout.test.tsx > AuthLayout > renders subtitle when provided
 · src/components/auth/__tests__/AuthLayout.test.tsx > AuthLayout > does not render subtitle when not provided
 · src/components/auth/__tests__/AuthLayout.test.tsx > AuthLayout > renders avatar with correct attributes
 · src/components/auth/__tests__/AuthLayout.test.tsx > AuthLayout > renders children content
 · src/components/auth/__tests__/AuthLayout.test.tsx > AuthLayout > has proper responsive classes
 · src/components/ui/__tests__/Avatar.test.tsx > Avatar > renders image when provided valid src
 · src/components/ui/__tests__/Avatar.test.tsx > Avatar > shows loading state initially
 · src/components/ui/__tests__/Avatar.test.tsx > Avatar > shows initials fallback on error
 · src/components/ui/__tests__/Avatar.test.tsx > Avatar > applies correct size classes
 · src/components/ui/__tests__/Avatar.test.tsx > Avatar > handles custom className
 · src/components/layout/__tests__/Footer.test.tsx > Footer > renders copyright information
 · src/components/layout/__tests__/Footer.test.tsx > Footer > shows version information by default
 · src/components/layout/__tests__/Footer.test.tsx > Footer > hides version information when showVersion is false
 · src/components/layout/__tests__/Footer.test.tsx > Footer > applies custom className
 · src/components/layout/__tests__/Footer.test.tsx > Footer > has proper ARIA attributes
 · src/lib/__tests__/minimal.test.ts > Minimal Test > should pass basic test
 · src/lib/__tests__/minimal.test.ts > Minimal Test > should work with fake timers
 · src/lib/__tests__/minimal.test.ts > Minimal Test > should import WebhookService

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/lib/__tests__/webhook.integration.test.ts > Real n8n Webhook Integration > should successfully send message to real n8n webhook
WebhookError: Unknown error during webhook call
 ❯ WebhookService.makeWebhookRequest src/lib/webhookService.ts:563:13
    561| 
    562|       // Unknown errors
    563|       throw new WebhookError(
       |             ^
    564|         'Unknown error during webhook call',
    565|         WebhookErrorType.UNKNOWN_ERROR,
 ❯ timeout src/lib/webhookService.ts:330:30
 ❯ ServiceMonitoringService.makeMonitoredCall src/lib/serviceMonitoring.ts:315:20
 ❯ src/lib/__tests__/webhook.integration.test.ts:47:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { statusCode: undefined, isRetryable: true, originalError: { name: 'Error', message: 'TEST used global fetch; inject a mock via WebhookService deps', code: undefined } }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  src/lib/__tests__/webhook.integration.test.ts > Real n8n Webhook Integration > should perform health check successfully
TypeError: actual value must be number or bigint, received "undefined"
 ❯ src/lib/__tests__/webhook.integration.test.ts:70:39
     68| 
     69|     expect(healthStatus.status).toMatch(/healthy|degraded/);
     70|     expect(healthStatus.responseTime).toBeGreaterThan(0);
       |                                       ^
     71| 
     72|     if (healthStatus.status === 'healthy') {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > progresses through form steps correctly
TestingLibraryElementError: Found multiple elements with the text: Report a Bug

Here are the matching elements:

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</body>
 ❯ Object.getElementError node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ getElementError node_modules/@testing-library/dom/dist/query-helpers.js:20:35
 ❯ getMultipleElementsFoundError node_modules/@testing-library/dom/dist/query-helpers.js:23:10
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:55:13
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/components/bug-report/__tests__/BugReportForm.test.tsx:101:19
     99|     
    100|     // Should start with bug type selection and show the form header
    101|     expect(screen.getByText('Report a Bug')).toBeInTheDocument();
       |                   ^
    102|     expect(screen.getByTestId('bug-type-selector')).toBeInTheDocument(…
    103|     expect(screen.getByTestId('select-functionality-button')).toBeInTh…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > validates required fields
TestingLibraryElementError: Found multiple elements by: [data-testid="select-functionality-button"]

Here are the matching elements:

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
        <div
          class="mt-4 text-center"
        >
          <p
            class="text-xs text-gray-500"
          >
            Changes are being auto-saved...
          </p>
        </div>
      </div>
    </div>
  </div>
</body>
 ❯ Object.getElementError node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ getElementError node_modules/@testing-library/dom/dist/query-helpers.js:20:35
 ❯ getMultipleElementsFoundError node_modules/@testing-library/dom/dist/query-helpers.js:23:10
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:55:13
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/components/bug-report/__tests__/BugReportForm.test.tsx:141:28
    139|     
    140|     // Select bug type first
    141|     fireEvent.click(screen.getByTestId('select-functionality-button'));
       |                            ^
    142|     
    143|     await waitFor(() => {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > handles form submission successfully
TestingLibraryElementError: Found multiple elements with the text: Report a Bug

Here are the matching elements:

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
        <div
          class="mt-4 text-center"
        >
          <p
            class="text-xs text-gray-500"
          >
            Changes are being auto-saved...
          </p>
        </div>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</body>
 ❯ Object.getElementError node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ getElementError node_modules/@testing-library/dom/dist/query-helpers.js:20:35
 ❯ getMultipleElementsFoundError node_modules/@testing-library/dom/dist/query-helpers.js:23:10
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:55:13
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/components/bug-report/__tests__/BugReportForm.test.tsx:153:19
    151|     
    152|     // Verify the component renders with form elements
    153|     expect(screen.getByText('Report a Bug')).toBeInTheDocument();
       |                   ^
    154|     expect(screen.getByTestId('select-functionality-button')).toBeInTh…
    155|     

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > handles form cancellation
TestingLibraryElementError: Found multiple elements by: [data-testid="select-functionality-button"]

Here are the matching elements:

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

Ignored nodes: comments, script, style
<button
  data-testid="select-functionality-button"
>
  Select Functionality
</button>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1...
 ❯ Object.getElementError node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ getElementError node_modules/@testing-library/dom/dist/query-helpers.js:20:35
 ❯ getMultipleElementsFoundError node_modules/@testing-library/dom/dist/query-helpers.js:23:10
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:55:13
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/components/bug-report/__tests__/BugReportForm.test.tsx:178:28
    176|     
    177|     // Go to a step where cancel button exists
    178|     fireEvent.click(screen.getByTestId('select-functionality-button'));
       |                            ^
    179|     
    180|     // This would test actual cancel button interaction

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > handles file attachment uploads
TestingLibraryElementError: Found multiple elements with the text: Report a Bug

Here are the matching elements:

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

Ignored nodes: comments, script, style
<h2
  class="text-xl font-semibold text-gray-900 mb-2"
>
  Report a Bug
</h2>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div />
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                3
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Attachments
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center "
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                4
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Review
              </span>
            </div>
          </div>
        </div>
        <form>
          <div
            data-testid="bug-type-selector"
          >
            <button
              data-testid="select-functionality-button"
            >
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div>
    <div
      class="rounded-lg border bg-card text-card-foreground shadow-sm bug-report-form"
    >
      <div
        class="p-6"
      >
        <div
          class="mb-6"
        >
          <h2
            class="text-xl font-semibold text-gray-900 mb-2"
          >
            Report a Bug
          </h2>
          <p
            class="text-gray-600 text-sm"
          >
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>
        <div
          class="mb-6"
        >
          <div
            class="flex items-center justify-between text-sm"
          >
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-blue-600 border-blue-600 text-white"
              >
                1
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Bug Type
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-gray-100 border-gray-300 text-gray-500"
              >
                2
              </div>
              <span
                class="ml-2 text-xs text-gray-600"
              >
                Details
              </span>
              <div
                class="flex-1 h-0.5 bg-gray-200 mx-4"
              />
            </div>
            <div
              class="flex items-center flex-1...
 ❯ Object.getElementError node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ getElementError node_modules/@testing-library/dom/dist/query-helpers.js:20:35
 ❯ getMultipleElementsFoundError node_modules/@testing-library/dom/dist/query-helpers.js:23:10
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:55:13
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/components/bug-report/__tests__/BugReportForm.test.tsx:224:19
    222|     // Verify the initial state includes the file attachment mock comp…
    223|     // This tests that the component structure is properly set up
    224|     expect(screen.getByText('Report a Bug')).toBeInTheDocument();
       |                   ^
    225|     expect(screen.getByTestId('select-functionality-button')).toBeInTh…
    226|     

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  2 failed | 23 passed | 15 skipped (40)
      Tests  7 failed | 414 passed | 31 skipped (525)
   Start at  06:38:23
   Duration  13.90s (transform 1.12s, setup 207ms, collect 1.86s, tests 10.81s, environment 436ms, prepare 173ms)

❌ Tests failed
🛑 Deployment cancelled due to test failures
Error: Process completed with exit code 1.