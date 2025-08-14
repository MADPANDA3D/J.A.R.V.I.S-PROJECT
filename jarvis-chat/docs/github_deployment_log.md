Run echo "🧪 Running test suite..."
🧪 Running test suite...
> jarvis-chat@0.0.0 test:ci
> NODE_OPTIONS='--max-old-space-size=8192' vitest run --pool=forks --poolOptions.forks.singleFork=true --reporter=verbose --bail=10
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
(node:2233) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 4)
(Use `node --trace-warnings ...` to show where the warning was created)
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Message Sending Success Scenarios > should send message successfully with valid payload 6ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Message Sending Success Scenarios > should include request metadata in payload 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Message Sending Success Scenarios > should handle response with additional fields 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should throw validation error for missing webhook URL 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should handle HTTP error responses 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should handle network errors 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should handle timeout errors 4ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should handle malformed response format 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should handle webhook response with success: false 1ms
(node:2233) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 11)
(node:2233) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 15)
(node:2233) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 19)
(node:2233) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 23)
(node:2233) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 28)
(node:2233) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 32)
(node:2233) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 34)
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should retry on retryable errors with fake timer advancement 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should not retry on non-retryable errors 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should respect max attempts 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should calculate exponential backoff delays 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should not retry on 4xx client errors (except 408, 429) 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should retry on retryable HTTP status codes 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should open circuit after failure threshold with fake timers 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should reset circuit breaker on successful request 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should provide circuit breaker configuration methods 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should allow manual circuit breaker reset 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Webhook Payload Validation > should validate required payload fields 4ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Webhook Payload Validation > should include optional payload fields when provided 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Webhook Payload Validation > should validate webhook response format strictly 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Performance and Metrics > should track request metrics 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Performance and Metrics > should track error metrics on failures 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Performance and Metrics > should calculate percentile response times 4ms
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
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should create webhook configuration with admin permissions 26ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should return 401 for missing admin permissions 8ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should validate webhook configuration 11ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should support different authentication types 11ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should support event filtering 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform pattern analysis 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform resolution analysis 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform severity classification 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform duplicate detection 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform user impact analysis 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should return 400 for invalid analysis type 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should return 404 for non-existent bug 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should support analysis context options 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should setup Sentry integration with admin permissions 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should return 401 for missing admin permissions 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should validate Sentry configuration 4ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should handle connection test failures 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should setup DataDog integration with admin permissions 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should return 401 for missing admin permissions 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should validate DataDog configuration 4ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should support different DataDog sites 11ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > GET /api/integrations/:id/status > should return integration status 8ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > GET /api/integrations/:id/status > should return 404 for non-existent integration 7ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > GET /api/integrations > should list all integrations with summary 7ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should format bug data for Sentry correctly 1ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should format bug data for DataDog correctly 1ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should format bug data for Slack correctly 15ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should get delivery statistics 1ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Error Handling > should handle malformed webhook configurations 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Error Handling > should handle service unavailability gracefully 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should create export request with export permissions 7ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should return 401 for missing export permissions 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should validate export format 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should support all valid export formats 10ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should apply export templates 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should return 503 when export queue is full 10ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id > should return export status for valid export ID 5ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id > should return 404 for non-existent export ID 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id > should include progress for processing exports 106ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id/download > should download completed export file 508ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id/download > should return 400 for incomplete export 7ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should create scheduled export with admin permissions 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should return 401 for missing admin permissions 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should validate schedule configuration 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should support different schedule frequencies 5ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/templates > should return available export templates 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/templates > should filter templates by user access 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Export Processing > should handle large dataset exports 19ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Export Processing > should apply field selection correctly 208ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Export Processing > should handle export failures gracefully 208ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Custom Processing Options > should apply data anonymization when requested 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Custom Processing Options > should flatten nested objects when requested 3ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Payload Schema Validation > should validate a basic valid payload 4ms
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
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Response Schema Validation > should validate error webhook response 2ms
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
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should return paginated bugs with valid API key 7ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should return 401 for invalid API key 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should return 401 for missing API key 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should apply status filters correctly 4ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should apply date range filters correctly 4ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should enforce pagination limits 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/:id > should return bug details with valid ID 4ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/:id > should return 404 for non-existent bug 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > PUT /api/bugs/:id/status > should update bug status with write permissions 6ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > PUT /api/bugs/:id/status > should return 400 for invalid status 4ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > PUT /api/bugs/:id/status > should return 401 for insufficient permissions 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/:id/assign > should assign bug with write permissions 4ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/:id/assign > should return 400 for failed assignment 4ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/search > should perform text search with results 4ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/search > should return empty results for no matches 4ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/analytics > should return analytics data 5ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/analytics > should use default time range when not specified 3ms
 ↓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Rate Limiting > should enforce rate limits
 ↓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Error Handling > should handle database errors gracefully
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Error Handling > should handle service errors gracefully 10ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Input Validation > should validate required fields for status updates 4ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Input Validation > should validate required fields for assignments 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Input Validation > should validate pagination parameters 3ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should record successful requests correctly 5ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should record failed requests correctly 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should calculate percentiles correctly 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should track requests per minute and hour 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should determine health status based on metrics 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should handle empty metrics gracefully 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should maintain performance history size limit 11ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should initialize with default alert rules 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should trigger high error rate alert 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should trigger slow response time alert 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should respect alert cooldown periods 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should allow custom alert rules 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should allow alert resolution 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should generate descriptive alert messages 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Dashboard Data > should generate comprehensive dashboard data 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Dashboard Data > should include performance trends in dashboard data 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Dashboard Data > should limit recent alerts in dashboard data 3ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert Subscription Management > should allow multiple subscribers 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert Subscription Management > should handle subscriber errors gracefully 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert Subscription Management > should properly unsubscribe callbacks 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Circuit Breaker Integration > should infer circuit breaker state from error patterns 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Circuit Breaker Integration > should detect half-open circuit breaker state 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Circuit Breaker Integration > should show closed circuit breaker for healthy patterns 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Data Cleanup and Management > should clear history and alerts properly 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Data Cleanup and Management > should handle concurrent request recording safely 3ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Singleton Instance > should provide working singleton instance 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Singleton Instance > should maintain state across singleton access 1ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > completes full bug report submission workflow 4ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > integrates error tracking with bug reports 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > integrates performance monitoring 1ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > handles validation errors properly 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > handles file upload failures gracefully 1ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > detects and prevents duplicate submissions 1ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > processes submission queue correctly 19ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > maintains data integrity throughout the process 3ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > handles system errors and recovers gracefully 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > generates proper tracking numbers 3ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > maintains performance under load 19ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > assigns bug to team member successfully 4ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > handles assignment to non-existent user 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > handles database update failures 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > tracks assignment history 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > handles reassignment correctly 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Auto Assignment > auto-assigns bug successfully 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Auto Assignment > returns null when no suitable assignee found 4ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Auto Assignment > considers workload when auto-assigning 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Recommendations > generates assignment recommendations 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Recommendations > sorts recommendations by confidence 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Recommendations > considers skill matching in recommendations 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Priority Escalation > escalates bug priority successfully 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Priority Escalation > prevents escalation beyond maximum priority 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Priority Escalation > sends escalation alerts to managers 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > calculates workload metrics correctly 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > identifies workload imbalances 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > updates team member information 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > handles update of non-existent team member 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Rules > applies assignment rules correctly 3ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Rules > falls back to recommendations when no rules match 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Error Handling > handles bug fetch errors gracefully 1ms
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
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Development Environment > should allow insecure configurations in development 3ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Staging Environment > should validate complete staging setup 3ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Staging Environment > should enforce HTTPS in staging 2ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Production Environment > should validate complete production setup 3ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Production Environment > should reject insecure production configurations 2ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Production Environment > should require HTTPS for all external services in production 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Health Check Integration > should provide comprehensive health status 2ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Health Check Integration > should detect configuration problems in health checks 3ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Production Readiness Assessment > should correctly assess production readiness 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Production Readiness Assessment > should reject non-production-ready configuration 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Cross-System Dependencies > should validate database and webhook integration 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Cross-System Dependencies > should validate monitoring integration 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Error Correlation > should correlate related errors across systems 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete System Validation > should validate entire system health 2ms
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
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Secret Access Logging > should limit audit log size 4ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Rotation Status > should track rotation status 2ms
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
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Tracking > should track page load time 5ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Tracking > should track API response times 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Tracking > should track API errors for 4xx/5xx status codes 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Tracking > should track user interactions 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Custom Metrics > should track custom metrics with tags 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Custom Metrics > should track business events 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > User Tracking > should set user information 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Transactions > should create and finish transactions 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Transactions > should track transaction duration as metric 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Error Tracking > should capture exceptions 5ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Error Tracking > should capture messages with different levels 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Core Web Vitals > should collect Core Web Vitals 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Metrics Filtering > should filter metrics by name 3ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Metrics Filtering > should filter metrics by time range 3ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Health Monitoring > should report monitoring health status 3ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Health Monitoring > should report degraded status with many errors 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > External Integration > should handle missing external APM services gracefully 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > External Integration > should send to external services when available 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Memory Management > should limit metrics storage to prevent memory leaks 15ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Memory Management > should limit events storage to prevent memory leaks 6ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Wrapper > should wrap functions with monitoring 3ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Wrapper > should handle function errors and track them 3ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Message Sending Success Scenarios > should send message successfully with valid payload 3ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Message Sending Success Scenarios > should include request metadata in payload 2ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should throw validation error for missing webhook URL 1ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle HTTP error responses 303ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle network errors 305ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle malformed response format 3ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Basic Retry Logic > should retry on retryable errors and eventually succeed 303ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Basic Retry Logic > should not retry on non-retryable errors 3ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Webhook Payload Validation > should validate required payload fields 2ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Webhook Payload Validation > should include optional payload fields when provided 1ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Performance and Metrics > should track request metrics on success 1ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Performance and Metrics > should track error metrics on failures 303ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Health Check > should perform health check successfully 3ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Health Check > should return unhealthy status on errors 303ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Configuration and Security > should include standard headers in all requests 3ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Configuration and Security > should generate unique request IDs 2ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Configuration and Security > should provide circuit breaker configuration methods 1ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Configuration and Security > should allow manual circuit breaker reset 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Enhanced Error Reports > should create enhanced error reports with session info 4ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Enhanced Error Reports > should generate fingerprints for error grouping 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Enhanced Error Reports > should include release and environment information 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Breadcrumb System > should add breadcrumbs with proper categorization 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Breadcrumb System > should limit breadcrumb storage 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Breadcrumb System > should include breadcrumbs in error reports 3ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > API Failure Tracking > should track API failures with detailed context 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > API Failure Tracking > should add breadcrumbs for API failures 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Authentication Error Tracking > should track auth errors with context 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Authentication Error Tracking > should add breadcrumbs for auth events 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > User Action Tracking > should track user actions as breadcrumbs 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > User Action Tracking > should handle different action types 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Tags Management > should set and retrieve tags 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Tags Management > should merge tags when setting multiple times 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Tags Management > should include tags in error reports 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Session Integration > should include session ID in error reports 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Session Integration > should set user context 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Performance > should handle high volume of errors efficiently 57ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Performance > should limit stored errors to prevent memory leaks 122ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Data Persistence > should persist errors to localStorage 4ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Data Persistence > should persist breadcrumbs to localStorage 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Data Persistence > should handle localStorage errors gracefully 3ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > External Monitoring Integration > should send errors to external monitoring asynchronously 30ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > External Monitoring Integration > should send breadcrumbs to external monitoring 17ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Environment Template Files > should have .env.template for development 3ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Environment Template Files > should have .env.staging.template for staging 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Environment Template Files > should have .env.production.template for production 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Template Content Validation > should include all required variables in development template 4ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Template Content Validation > should include production-specific variables in production template 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Template Content Validation > should include staging-specific variables in staging template 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Security Annotations > should have security warnings in all templates 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Security Annotations > should mark sensitive variables appropriately 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Template Format Validation > should use proper environment variable format 2ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Template Format Validation > should have consistent variable naming 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Template Completeness > should cover all configuration categories 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Template Completeness > should provide example values where appropriate 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Environment-Specific Differences > should have appropriate differences between environments 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Documentation Quality > should have comprehensive comments 2ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should use webhook service with proper payload structure 3ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should handle webhook service errors gracefully 2ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should use fallback response when circuit breaker is open 2661ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should use fallback response when webhook URL not configured 2943ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should include conversation ID in webhook payload when provided 4ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should handle missing conversation ID gracefully 2ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Webhook Status Monitoring > should return webhook health status and metrics 3ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Webhook Status Monitoring > should handle health check errors gracefully 1ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Webhook Status Monitoring > should detect when webhook is not configured 1ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Integration with Existing Features > should maintain backward compatibility with existing methods 1ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Integration with Existing Features > should pass conversation ID to enhanced webhook service 3ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > rendering > should render the tools button with correct selected count 46ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > rendering > should render compact version correctly 19ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > rendering > should show loading state 8ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > tool selection > should toggle tool selection when checkbox is clicked 30ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > tool selection > should display tools grouped by category 18ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > selected tools display > should show correct selected count in main label 18ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > selected tools display > should show "No tools selected" message when none are selected 20ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > tool information display > should display tool names and descriptions 20ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > tool information display > should show helpful message about tool usage 26ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > accessibility > should have proper aria-label for the main button 17ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > accessibility > should update aria-label when selection changes 14ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > error handling > should handle tools loading error gracefully 13ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > dropdown behavior > should open and close dropdown correctly 15ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > initialization > should initialize with default tools when user is not logged in 6ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > initialization > should load saved preferences from localStorage when user is logged in 5ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > tool selection > should toggle tool selection correctly 5ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > tool selection > should save selections to localStorage when changed 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > getSelectedToolIds > should return only enabled tool IDs 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > preferences management > should update preferences correctly 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > resetToDefaults > should reset to default selections and preferences 6ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > error handling > should handle localStorage errors gracefully 5ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > analytics > should generate session ID when recording usage 5ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > analytics > should not record usage when analytics is disabled 6ms
 ✓ src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > renders initial bug type selection step 16ms
 ✓ src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > progresses through form steps correctly 7ms
 ✓ src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > validates required fields 25ms
 ✓ src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > handles form submission successfully 14ms
 ✓ src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > displays success message after submission 7ms
 ✓ src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > handles form cancellation 11ms
 ✓ src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > supports auto-save functionality 11ms
 ✓ src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > handles file attachment uploads 14ms
 ✓ src/lib/__tests__/webhook.diagnostic.test.ts > Webhook Diagnostics > should diagnose webhook connectivity and provide setup guidance 4ms
 ✓ src/lib/__tests__/webhook.diagnostic.test.ts > Webhook Diagnostics > should test webhook response format expectations 2ms
 ✓ src/lib/__tests__/webhook.diagnostic.test.ts > Webhook Diagnostics > should provide n8n workflow setup guidance 1ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Creation > should create a new session on initialization 5ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Creation > should generate unique session IDs 3ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Creation > should collect device information 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > User Management > should set user ID and metadata 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > User Management > should track auth events 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > User Management > should track failed auth events 4ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Analytics > should calculate session analytics 3ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Analytics > should track most visited pages 2ms
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
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > creates bug report successfully 6ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > collects enhanced error context 3ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > integrates with performance metrics 3ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > handles database submission errors 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > logs submission activity 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > handles missing browser info gracefully 4ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > correlates bug reports with errors 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > generates correlation IDs for tracking 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > handles network errors gracefully 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > collects comprehensive monitoring data 2ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should initialize with correct default state 6ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should detect when app is installed in standalone mode 5ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle beforeinstallprompt event 6ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle successful installation 5ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle installation rejection 6ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle installation error 4ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle appinstalled event 4ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should clear error when clearError is called 3ms
 ✓ src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should return false for install when no prompt is available 3ms
 ↓ src/lib/__tests__/webhook.integration.test.ts > Real n8n Webhook Integration > should successfully send message to real n8n webhook
 ↓ src/lib/__tests__/webhook.integration.test.ts > Real n8n Webhook Integration > should perform health check successfully
 ↓ src/lib/__tests__/webhook.integration.test.ts > Real n8n Webhook Integration > should handle conversation context properly
 ↓ src/lib/__tests__/webhook.integration.test.ts > Real n8n Webhook Integration > should demonstrate error recovery and circuit breaker
 ↓ src/lib/__tests__/webhook.integration.test.ts > Real n8n Webhook Integration > should test different message types and formats
 ✓ src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should show "Installed" badge when app is installed 8ms
 ✓ src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should show "Installed" badge when in standalone mode 5ms
 ✓ src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should show "Web App" badge when PWA is supported but not installed 4ms
 ✓ src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should show "Browser" badge when PWA is not supported 3ms
 ✓ src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should show install button when canInstall is true and showInstallButton is true 7ms
 ✓ src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should not show install button when showInstallButton is false 5ms
 ✓ src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should call install when install button is clicked 6ms
 ✓ src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should show "Installing..." when isInstalling is true 8ms
 ✓ src/components/pwa/__tests__/PWAStatus.test.tsx > PWAStatus > should show "Install App" on mobile devices 6ms
 ✓ src/hooks/__tests__/useChat.test.ts > useChat > should initialize with empty state 6ms
 ✓ src/hooks/__tests__/useChat.test.ts > useChat > should load message history when user logs in 55ms
 ✓ src/hooks/__tests__/useChat.test.ts > useChat > should handle send message successfully 6ms
 ✓ src/hooks/__tests__/useChat.test.ts > useChat > should handle send message error 6ms
 ✓ src/hooks/__tests__/useChat.test.ts > useChat > should not send empty messages 5ms
 ✓ src/hooks/__tests__/useChat.test.ts > useChat > should clear messages 4ms
 ✓ src/hooks/__tests__/useChat.test.ts > useChat > should clear error 3ms
 ✓ scripts/__tests__/webhook-server.test.js > Webhook Secret Synchronization Tests > should generate correct HMAC-SHA256 signature 4ms
 ✓ scripts/__tests__/webhook-server.test.js > Webhook Secret Synchronization Tests > should verify GitHub webhook signature correctly 3ms
 ✓ scripts/__tests__/webhook-server.test.js > Webhook Secret Synchronization Tests > should reject invalid webhook signature 3ms
 ✓ scripts/__tests__/webhook-server.test.js > Webhook Secret Synchronization Tests > should handle missing signature gracefully 2ms
 ✓ scripts/__tests__/webhook-server.test.js > Webhook Event Handler Tests > should handle ping event correctly 2ms
 ✓ scripts/__tests__/webhook-server.test.js > Webhook Event Handler Tests > should handle workflow_run event correctly 2ms
 ✓ scripts/__tests__/webhook-server.test.js > Environment Variable Tests > should load webhook secret from environment 2ms
 ✓ scripts/__tests__/webhook-server.test.js > Environment Variable Tests > should use default value when environment variable not set 1ms
 ✓ src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should not render when canInstall is false 7ms
 ✓ src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should render install prompt when canInstall is true 14ms
 ✓ src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should call install when install button is clicked 11ms
 ✓ src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should show installing state when isInstalling is true 8ms
 ✓ src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should display error message when installError is present 8ms
 ✓ src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should dismiss prompt when X button is clicked 10ms
 ✓ src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should respect showDelay prop 108ms
 ✓ src/components/pwa/__tests__/InstallPrompt.test.tsx > InstallPrompt > should hide prompt after successful installation 15ms
 ✓ src/lib/__tests__/webhook.live.test.ts > Live Webhook Test > should test the actual n8n webhook with Hello JARVIS message 4761ms
 ✓ src/components/auth/__tests__/ProtectedRoute.test.tsx > ProtectedRoute > should show loading spinner when auth is not initialized 10ms
 × src/components/auth/__tests__/ProtectedRoute.test.tsx > ProtectedRoute > should show loading spinner when auth is loading 11ms
   → Found multiple elements with the text: Checking authentication...
Here are the matching elements:
Ignored nodes: comments, script, style
<p
  class="text-sm text-muted-foreground"
>
  Checking authentication...
</p>
Ignored nodes: comments, script, style
<p
  class="text-sm text-muted-foreground"
>
  Checking authentication...
</p>
(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).
Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="min-h-screen flex items-center justify-center bg-background"
    >
      <div
        class="flex flex-col items-center space-y-4"
      >
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
        />
        <p
          class="text-sm text-muted-foreground"
        >
          Checking authentication...
        </p>
      </div>
    </div>
  </div>
  <div>
    <div
      class="min-h-screen flex items-center justify-center bg-background"
    >
      <div
        class="flex flex-col items-center space-y-4"
      >
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
        />
        <p
          class="text-sm text-muted-foreground"
        >
          Checking authentication...
        </p>
      </div>
    </div>
  </div>
</body>
<--- Last few GCs --->
[2233:0x3ff60550]   596577 ms: Mark-Compact 8118.1 (8238.1) -> 8103.5 (8239.3) MB, 4307.07 / 0.00 ms  (average mu = 0.710, current mu = 0.030) allocation failure; scavenge might not succeed
[2233:0x3ff60550]   602706 ms: Mark-Compact 8119.4 (8239.3) -> 8104.9 (8240.6) MB, 5869.04 / 0.00 ms  (average mu = 0.493, current mu = 0.042) allocation failure; scavenge might not succeed
<--- JS stacktrace --->
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
----- Native stack trace -----
 1: 0xb8cf03 node::OOMErrorHandler(char const*, v8::OOMDetails const&) [node (vitest 1)]
 2: 0xf060d0 v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, v8::OOMDetails const&) [node (vitest 1)]
 3: 0xf063b7 v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, v8::OOMDetails const&) [node (vitest 1)]
 4: 0x1118005  [node (vitest 1)]
 5: 0x112fe88 v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags) [node (vitest 1)]
 6: 0x1105fa1 v8::internal::HeapAllocator::AllocateRawWithLightRetrySlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [node (vitest 1)]
 7: 0x1107135 v8::internal::HeapAllocator::AllocateRawWithRetryOrFailSlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [node (vitest 1)]
 8: 0x10e4786 v8::internal::Factory::NewFillerObject(int, v8::internal::AllocationAlignment, v8::internal::AllocationType, v8::internal::AllocationOrigin) [node (vitest 1)]
 9: 0x15402c6 v8::internal::Runtime_AllocateInYoungGeneration(int, unsigned long*, v8::internal::Isolate*) [node (vitest 1)]
10: 0x7f865de99ef6 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  src/components/auth/__tests__/ProtectedRoute.test.tsx > ProtectedRoute > should show loading spinner when auth is loading
TestingLibraryElementError: Found multiple elements with the text: Checking authentication...
Here are the matching elements:
Ignored nodes: comments, script, style
<p
  class="text-sm text-muted-foreground"
>
  Checking authentication...
</p>
Ignored nodes: comments, script, style
<p
  class="text-sm text-muted-foreground"
>
  Checking authentication...
</p>
(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).
Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="min-h-screen flex items-center justify-center bg-background"
    >
      <div
        class="flex flex-col items-center space-y-4"
      >
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
        />
        <p
          class="text-sm text-muted-foreground"
        >
          Checking authentication...
        </p>
      </div>
    </div>
  </div>
  <div>
    <div
      class="min-h-screen flex items-center justify-center bg-background"
    >
      <div
        class="flex flex-col items-center space-y-4"
      >
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
        />
        <p
          class="text-sm text-muted-foreground"
        >
          Checking authentication...
        </p>
      </div>
    </div>
  </div>
</body>
 ❯ Object.getElementError node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ getElementError node_modules/@testing-library/dom/dist/query-helpers.js:20:35
 ❯ getMultipleElementsFoundError node_modules/@testing-library/dom/dist/query-helpers.js:23:10
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:55:13
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/components/auth/__tests__/ProtectedRoute.test.tsx:73:19
     71|     );
     72| 
     73|     expect(screen.getByText('Checking authentication...')).toBeInTheDo…
       |                   ^
     74|     expect(screen.queryByTestId('protected-content')).not.toBeInTheDoc…
     75|   });
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯
⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯

Vitest caught 1 unhandled error during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.
⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯
Error: Worker exited unexpectedly
 ❯ ChildProcess.onUnexpectedExit node_modules/tinypool/dist/index.js:118:30
 ❯ ChildProcess.emit node:events:536:35
 ❯ ChildProcess._handle.onexit node:internal/child_process:293:12
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
 Test Files  29 passed | 2 skipped (40)
      Tests  1 failed | 453 passed | 36 skipped (492)
     Errors  1 error
   Start at  07:32:05
   Duration  656.75s (transform 1.12s, setup 194ms, collect 1.84s, tests 14.91s, environment 432ms, prepare 178ms)
node:internal/child_process:753
    const ex = new ERR_IPC_CHANNEL_CLOSED();
               ^
Error [ERR_IPC_CHANNEL_CLOSED]: Channel closed
    at target.send (node:internal/child_process:753:16)
    at ProcessWorker.send (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/tinypool/dist/index.js:140:41)
    at MessagePort.<anonymous> (file:///home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/node_modules/tinypool/dist/index.js:149:62)
    at [nodejs.internal.kHybridDispatch] (node:internal/event_target:831:20)
    at MessagePort.<anonymous> (node:internal/per_context/messageport:23:28) {
  code: 'ERR_IPC_CHANNEL_CLOSED'
}
Node.js v20.19.4
❌ Tests failed
🛑 Deployment cancelled due to test failures
Error: Process completed with exit code 1.