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
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Message Sending Success Scenarios > should include request metadata in payload 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Message Sending Success Scenarios > should handle response with additional fields 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should throw validation error for missing webhook URL 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should handle HTTP error responses 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should handle network errors 2ms
(node:2213) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 4)
(Use `node --trace-warnings ...` to show where the warning was created)
(node:2213) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 11)
(node:2213) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 15)
(node:2213) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 19)
(node:2213) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 23)
(node:2213) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 28)
(node:2213) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 32)
(node:2213) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 34)
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should handle timeout errors 5ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should handle malformed response format 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Error Handling > should handle webhook response with success: false 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should retry on retryable errors with fake timer advancement 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should not retry on non-retryable errors 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should respect max attempts 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should calculate exponential backoff delays 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should not retry on 4xx client errors (except 408, 429) 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should retry on retryable HTTP status codes 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should open circuit after failure threshold with fake timers 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should reset circuit breaker on successful request 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should provide circuit breaker configuration methods 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should allow manual circuit breaker reset 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Webhook Payload Validation > should validate required payload fields 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Webhook Payload Validation > should include optional payload fields when provided 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Webhook Payload Validation > should validate webhook response format strictly 6ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Performance and Metrics > should track request metrics 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Performance and Metrics > should track error metrics on failures 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Performance and Metrics > should calculate percentile response times 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Performance and Metrics > should include last request timestamp in metrics 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Health Check > should perform health check successfully 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Health Check > should return unhealthy status on errors 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Concurrent Request Handling > should handle multiple concurrent requests 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Concurrent Request Handling > should handle mixed success/failure in concurrent requests 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Authentication and Security > should include authorization header when secret is provided 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Authentication and Security > should include standard headers in all requests 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Authentication and Security > should generate unique request IDs 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Timer Management and Cleanup > should not have pending timers after operation completion 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Timer Management and Cleanup > should clean up resources on destroy 1ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should create webhook configuration with admin permissions 25ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should return 401 for missing admin permissions 4ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should validate webhook configuration 10ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should support different authentication types 11ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should support event filtering 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform pattern analysis 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform resolution analysis 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform severity classification 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform duplicate detection 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform user impact analysis 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should return 400 for invalid analysis type 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should return 404 for non-existent bug 6ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should support analysis context options 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should setup Sentry integration with admin permissions 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should return 401 for missing admin permissions 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should validate Sentry configuration 4ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should handle connection test failures 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should setup DataDog integration with admin permissions 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should return 401 for missing admin permissions 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should validate DataDog configuration 4ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should support different DataDog sites 5ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > GET /api/integrations/:id/status > should return integration status 5ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > GET /api/integrations/:id/status > should return 404 for non-existent integration 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > GET /api/integrations > should list all integrations with summary 7ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should format bug data for Sentry correctly 1ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should format bug data for DataDog correctly 1ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should format bug data for Slack correctly 20ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should get delivery statistics 1ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Error Handling > should handle malformed webhook configurations 4ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Error Handling > should handle service unavailability gracefully 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should create export request with export permissions 6ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should return 401 for missing export permissions 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should validate export format 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should support all valid export formats 10ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should apply export templates 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should return 503 when export queue is full 10ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id > should return export status for valid export ID 6ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id > should return 404 for non-existent export ID 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id > should include progress for processing exports 106ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id/download > should download completed export file 507ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id/download > should return 400 for incomplete export 5ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should create scheduled export with admin permissions 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should return 401 for missing admin permissions 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should validate schedule configuration 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should support different schedule frequencies 5ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/templates > should return available export templates 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/templates > should filter templates by user access 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Export Processing > should handle large dataset exports 20ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Export Processing > should apply field selection correctly 205ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Export Processing > should handle export failures gracefully 206ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Custom Processing Options > should apply data anonymization when requested 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Custom Processing Options > should flatten nested objects when requested 3ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Payload Schema Validation > should validate a basic valid payload 3ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Payload Schema Validation > should validate payload with all optional fields 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Payload Schema Validation > should reject payload with missing required fields 2ms
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
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Response Schema Validation > should validate optional response fields 0ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Health Check Response Schema Validation > should validate healthy status response 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Health Check Response Schema Validation > should validate degraded status response 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Health Check Response Schema Validation > should reject invalid health status values 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Health Check Response Schema Validation > should validate minimal health check response 0ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Validation Error Schema > should create properly structured validation errors 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > WebhookValidator Utility Methods > should create validated payload with createValidatedPayload 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > WebhookValidator Utility Methods > should throw error for invalid payload construction 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > WebhookValidator Utility Methods > should provide validation summary 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > WebhookValidator Utility Methods > should provide detailed validation summary for invalid payload 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > WebhookValidator Utility Methods > should handle edge cases in validation summary 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Schema Integration Tests > should work with real-world payload example 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Schema Integration Tests > should handle complex validation error scenarios 1ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should return paginated bugs with valid API key 6ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should return 401 for invalid API key 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should return 401 for missing API key 5ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should apply status filters correctly 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should apply date range filters correctly 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should enforce pagination limits 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/:id > should return bug details with valid ID 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/:id > should return 404 for non-existent bug 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > PUT /api/bugs/:id/status > should update bug status with write permissions 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > PUT /api/bugs/:id/status > should return 400 for invalid status 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > PUT /api/bugs/:id/status > should return 401 for insufficient permissions 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/:id/assign > should assign bug with write permissions 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/:id/assign > should return 400 for failed assignment 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/search > should perform text search with results 6ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/search > should return empty results for no matches 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/analytics > should return analytics data 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/analytics > should use default time range when not specified 2ms
 ↓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Rate Limiting > should enforce rate limits
 ↓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Error Handling > should handle database errors gracefully
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Error Handling > should handle service errors gracefully 8ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Input Validation > should validate required fields for status updates 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Input Validation > should validate required fields for assignments 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Input Validation > should validate pagination parameters 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should record successful requests correctly 3ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should record failed requests correctly 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should calculate percentiles correctly 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should track requests per minute and hour 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should determine health status based on metrics 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should handle empty metrics gracefully 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should maintain performance history size limit 11ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should initialize with default alert rules 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should trigger high error rate alert 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should trigger slow response time alert 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should respect alert cooldown periods 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should allow custom alert rules 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should allow alert resolution 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should generate descriptive alert messages 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Dashboard Data > should generate comprehensive dashboard data 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Dashboard Data > should include performance trends in dashboard data 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Dashboard Data > should limit recent alerts in dashboard data 4ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert Subscription Management > should allow multiple subscribers 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert Subscription Management > should handle subscriber errors gracefully 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert Subscription Management > should properly unsubscribe callbacks 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Circuit Breaker Integration > should infer circuit breaker state from error patterns 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Circuit Breaker Integration > should detect half-open circuit breaker state 3ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Circuit Breaker Integration > should show closed circuit breaker for healthy patterns 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Data Cleanup and Management > should clear history and alerts properly 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Data Cleanup and Management > should handle concurrent request recording safely 3ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Singleton Instance > should provide working singleton instance 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Singleton Instance > should maintain state across singleton access 1ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > completes full bug report submission workflow 4ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > integrates error tracking with bug reports 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > integrates performance monitoring 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > handles validation errors properly 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > handles file upload failures gracefully 1ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > detects and prevents duplicate submissions 1ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > processes submission queue correctly 16ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > maintains data integrity throughout the process 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > handles system errors and recovers gracefully 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > generates proper tracking numbers 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > maintains performance under load 17ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > assigns bug to team member successfully 3ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > handles assignment to non-existent user 1ms
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
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > calculates workload metrics correctly 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > identifies workload imbalances 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > updates team member information 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > handles update of non-existent team member 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Rules > applies assignment rules correctly 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Rules > falls back to recommendations when no rules match 1ms
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
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Development Environment > should allow insecure configurations in development 2ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Staging Environment > should validate complete staging setup 2ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Staging Environment > should enforce HTTPS in staging 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Production Environment > should validate complete production setup 2ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Production Environment > should reject insecure production configurations 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Production Environment > should require HTTPS for all external services in production 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Health Check Integration > should provide comprehensive health status 2ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Health Check Integration > should detect configuration problems in health checks 2ms
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
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Metrics Filtering > should filter metrics by name 3ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Metrics Filtering > should filter metrics by time range 4ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Health Monitoring > should report monitoring health status 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Health Monitoring > should report degraded status with many errors 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > External Integration > should handle missing external APM services gracefully 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > External Integration > should send to external services when available 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Memory Management > should limit metrics storage to prevent memory leaks 9ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Memory Management > should limit events storage to prevent memory leaks 7ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Wrapper > should wrap functions with monitoring 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Wrapper > should handle function errors and track them 2ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Message Sending Success Scenarios > should send message successfully with valid payload 3ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Message Sending Success Scenarios > should include request metadata in payload 2ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should throw validation error for missing webhook URL 1ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle HTTP error responses 303ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle network errors 304ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle malformed response format 3ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Basic Retry Logic > should retry on retryable errors and eventually succeed 303ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Basic Retry Logic > should not retry on non-retryable errors 3ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Webhook Payload Validation > should validate required payload fields 1ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Webhook Payload Validation > should include optional payload fields when provided 1ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Performance and Metrics > should track request metrics on success 1ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Performance and Metrics > should track error metrics on failures 303ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Health Check > should perform health check successfully 3ms
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
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Breadcrumb System > should include breadcrumbs in error reports 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > API Failure Tracking > should track API failures with detailed context 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > API Failure Tracking > should add breadcrumbs for API failures 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Authentication Error Tracking > should track auth errors with context 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Authentication Error Tracking > should add breadcrumbs for auth events 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > User Action Tracking > should track user actions as breadcrumbs 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > User Action Tracking > should handle different action types 3ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Tags Management > should set and retrieve tags 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Tags Management > should merge tags when setting multiple times 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Tags Management > should include tags in error reports 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Session Integration > should include session ID in error reports 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Session Integration > should set user context 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Performance > should handle high volume of errors efficiently 56ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Performance > should limit stored errors to prevent memory leaks 124ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Data Persistence > should persist errors to localStorage 3ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Data Persistence > should persist breadcrumbs to localStorage 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Data Persistence > should handle localStorage errors gracefully 3ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > External Monitoring Integration > should send errors to external monitoring asynchronously 28ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > External Monitoring Integration > should send breadcrumbs to external monitoring 14ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Environment Template Files > should have .env.template for development 2ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Environment Template Files > should have .env.staging.template for staging 1ms
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
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should use webhook service with proper payload structure 3ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should handle webhook service errors gracefully 2ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should use fallback response when circuit breaker is open 2696ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should use fallback response when webhook URL not configured 2213ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should include conversation ID in webhook payload when provided 3ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should handle missing conversation ID gracefully 2ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Webhook Status Monitoring > should return webhook health status and metrics 3ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Webhook Status Monitoring > should handle health check errors gracefully 1ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Webhook Status Monitoring > should detect when webhook is not configured 1ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Integration with Existing Features > should maintain backward compatibility with existing methods 1ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Integration with Existing Features > should pass conversation ID to enhanced webhook service 3ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > rendering > should render the tools button with correct selected count 44ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > rendering > should render compact version correctly 14ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > rendering > should show loading state 7ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > tool selection > should toggle tool selection when checkbox is clicked 27ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > tool selection > should display tools grouped by category 18ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > selected tools display > should show correct selected count in main label 12ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > selected tools display > should show "No tools selected" message when none are selected 18ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > tool information display > should display tool names and descriptions 19ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > tool information display > should show helpful message about tool usage 21ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > accessibility > should have proper aria-label for the main button 16ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > accessibility > should update aria-label when selection changes 12ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > error handling > should handle tools loading error gracefully 12ms
 ✓ src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > dropdown behavior > should open and close dropdown correctly 16ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > initialization > should initialize with default tools when user is not logged in 5ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > initialization > should load saved preferences from localStorage when user is logged in 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > tool selection > should toggle tool selection correctly 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > tool selection > should save selections to localStorage when changed 7ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > getSelectedToolIds > should return only enabled tool IDs 10ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > preferences management > should update preferences correctly 8ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > resetToDefaults > should reset to default selections and preferences 11ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > error handling > should handle localStorage errors gracefully 12ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > analytics > should generate session ID when recording usage 5ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > analytics > should not record usage when analytics is disabled 4ms
 × src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Creation > should create a new session on initialization 4ms
   → .toMatch() expects to receive a string, but got undefined
 × src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Creation > should generate unique session IDs 2ms
   → expected undefined not to be undefined // Object.is equality
 × src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Creation > should collect device information 2ms
   → expected undefined to be defined
 × src/lib/__tests__/sessionTracking.test.ts > Session Tracking > User Management > should set user ID and metadata 2ms
   → expected undefined to be 'test-user-123' // Object.is equality
 × src/lib/__tests__/sessionTracking.test.ts > Session Tracking > User Management > should track auth events 2ms
   → Target cannot be null or undefined.
 × src/lib/__tests__/sessionTracking.test.ts > Session Tracking > User Management > should track failed auth events 2ms
   → expected undefined to be false // Object.is equality
 × src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Analytics > should calculate session analytics 2ms
   → expected 0 to be greater than 0
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Analytics > should track most visited pages 1ms
 × src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session History > should maintain session history 2ms
   → expected 0 to be greater than 0
 × src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session History > should include current session in history 2ms
   → expected undefined to be defined
 × src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Error Integration > should increment error count 2ms
   → expected undefined to be 1 // Object.is equality
 × src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Data Persistence > should attempt to persist session data 2ms
   → expected "spy" to be called with arguments: [ 'jarvis_sessions', Any<String> ]
Number of calls: 0

 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Data Persistence > should handle localStorage errors gracefully 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Performance > should limit session storage size 2ms
 ✓ src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Performance > should handle rapid user actions without performance issues 2ms
 × src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Memory Management > should not leak memory with continuous usage 2ms
   → actual value must be number or bigint, received "undefined"
 ✓ src/lib/__tests__/webhook.diagnostic.test.ts > Webhook Diagnostics > should diagnose webhook connectivity and provide setup guidance 4ms
 ✓ src/lib/__tests__/webhook.diagnostic.test.ts > Webhook Diagnostics > should test webhook response format expectations 2ms
 ✓ src/lib/__tests__/webhook.diagnostic.test.ts > Webhook Diagnostics > should provide n8n workflow setup guidance 1ms
 ✓ src/lib/__tests__/env-validation.test.ts > Environment Validation > validateEnvironment > should return valid when all required variables are set 3ms
 ✓ src/lib/__tests__/env-validation.test.ts > Environment Validation > validateEnvironment > should return errors when required variables are missing 2ms
 ✓ src/lib/__tests__/env-validation.test.ts > Environment Validation > validateEnvironment > should validate URL format for Supabase URL 1ms
 ✓ src/lib/__tests__/env-validation.test.ts > Environment Validation > validateEnvironment > should validate JWT format for Supabase anon key 1ms
 ✓ src/lib/__tests__/env-validation.test.ts > Environment Validation > validateEnvironment > should add warnings for optional missing variables 1ms
 ✓ src/lib/__tests__/env-validation.test.ts > Environment Validation > getEnvironmentInfo > should return correct environment info structure 2ms
 ✓ src/lib/__tests__/env-validation.test.ts > Environment Validation > getEnvironmentInfo > should detect development environment 1ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > creates bug report successfully 4ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > collects enhanced error context 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > integrates with performance metrics 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > handles database submission errors 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > logs submission activity 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > handles missing browser info gracefully 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > correlates bug reports with errors 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > generates correlation IDs for tracking 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > handles network errors gracefully 2ms
 ✓ src/lib/__tests__/bugReporting.test.ts > BugReportingService > collects comprehensive monitoring data 2ms
 ✓ src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > renders initial bug type selection step 15ms
 × src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > progresses through form steps correctly 11ms
   → Found multiple elements with the text: Select Functionality
Here are the matching elements:
Ignored nodes: comments, script, style
<button>
  Select Functionality
</button>
Ignored nodes: comments, script, style
<button>
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
            <button>
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
            <button>
              Select Functionality
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</body>
 · src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > validates required fields
 · src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > handles form submission successfully
 · src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > displays success message after submission
 · src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > handles form cancellation
 · src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > supports auto-save functionality
 · src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > handles file attachment uploads
 · src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should initialize with correct default state
 · src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should detect when app is installed in standalone mode
 · src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle beforeinstallprompt event
 · src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle successful installation
 · src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle installation rejection
 · src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle installation error
 · src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should handle appinstalled event
 · src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should clear error when clearError is called
 · src/hooks/__tests__/usePWAInstall.test.ts > usePWAInstall > should return false for install when no prompt is available
 · src/lib/__tests__/webhook.integration.test.ts > Real n8n Webhook Integration > should successfully send message to real n8n webhook
 · src/lib/__tests__/webhook.integration.test.ts > Real n8n Webhook Integration > should perform health check successfully
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
⎯⎯⎯⎯⎯⎯ Failed Tests 13 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Creation > should create a new session on initialization
TypeError: .toMatch() expects to receive a string, but got undefined
 ❯ src/lib/__tests__/sessionTracking.test.ts:91:41
     89|       
     90|       expect(currentSession).toBeDefined();
     91|       expect(currentSession?.sessionId).toMatch(/^session_\d+_[a-z0-9]…
       |                                         ^
     92|       expect(currentSession?.startTime).toBeDefined();
     93|       expect(currentSession?.deviceInfo).toBeDefined();
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/13]⎯
 FAIL  src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Creation > should generate unique session IDs
AssertionError: expected undefined not to be undefined // Object.is equality
 ❯ src/lib/__tests__/sessionTracking.test.ts:102:39
    100|       const session2 = getCurrentSession();
    101|       
    102|       expect(session1?.sessionId).not.toBe(session2?.sessionId);
       |                                       ^
    103|     });
    104| 
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/13]⎯
 FAIL  src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Creation > should collect device information
AssertionError: expected undefined to be defined
 ❯ src/lib/__tests__/sessionTracking.test.ts:109:26
    107|       const deviceInfo = currentSession?.deviceInfo;
    108|       
    109|       expect(deviceInfo).toBeDefined();
       |                          ^
    110|       expect(deviceInfo?.userAgent).toBe('Mozilla/5.0 (Test Browser)');
    111|       expect(deviceInfo?.platform).toBe('Test Platform');
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/13]⎯
 FAIL  src/lib/__tests__/sessionTracking.test.ts > Session Tracking > User Management > should set user ID and metadata
AssertionError: expected undefined to be 'test-user-123' // Object.is equality
- Expected: 
"test-user-123"
+ Received: 
undefined
 ❯ src/lib/__tests__/sessionTracking.test.ts:126:38
    124|       
    125|       const currentSession = getCurrentSession();
    126|       expect(currentSession?.userId).toBe(userId);
       |                                      ^
    127|       expect(currentSession?.metadata).toEqual(expect.objectContaining…
    128|     });
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/13]⎯
 FAIL  src/lib/__tests__/sessionTracking.test.ts > Session Tracking > User Management > should track auth events
AssertionError: Target cannot be null or undefined.
 ❯ src/lib/__tests__/sessionTracking.test.ts:134:42
    132|       
    133|       const currentSession = getCurrentSession();
    134|       expect(currentSession?.authEvents).toHaveLength(2); // session_s…
       |                                          ^
    135|       
    136|       const signInEvent = currentSession?.authEvents.find((e) => e.typ…
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/13]⎯
 FAIL  src/lib/__tests__/sessionTracking.test.ts > Session Tracking > User Management > should track failed auth events
AssertionError: expected undefined to be false // Object.is equality
- Expected: 
false
+ Received: 
undefined
 ❯ src/lib/__tests__/sessionTracking.test.ts:148:36
    146|       const signInEvent = currentSession?.authEvents.find((e) => e.typ…
    147|       
    148|       expect(signInEvent?.success).toBe(false);
       |                                    ^
    149|       expect(signInEvent?.errorMessage).toBe('Invalid credentials');
    150|     });
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/13]⎯
 FAIL  src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session Analytics > should calculate session analytics
AssertionError: expected 0 to be greater than 0
 ❯ src/lib/__tests__/sessionTracking.test.ts:161:39
    159|       const analytics = getSessionAnalytics();
    160|       
    161|       expect(analytics.totalSessions).toBeGreaterThan(0);
       |                                       ^
    162|       expect(analytics.totalPageViews).toBeGreaterThan(0);
    163|       expect(analytics.averageSessionDuration).toBeGreaterThanOrEqual(…
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/13]⎯
 FAIL  src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session History > should maintain session history
AssertionError: expected 0 to be greater than 0
 ❯ src/lib/__tests__/sessionTracking.test.ts:179:30
    177|       
    178|       expect(Array.isArray(history)).toBe(true);
    179|       expect(history.length).toBeGreaterThan(0);
       |                              ^
    180|     });
    181| 
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/13]⎯
 FAIL  src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Session History > should include current session in history
AssertionError: expected undefined to be defined
 ❯ src/lib/__tests__/sessionTracking.test.ts:187:32
    185|       
    186|       const currentInHistory = history.find(s => s.sessionId === curre…
    187|       expect(currentInHistory).toBeDefined();
       |                                ^
    188|     });
    189|   });
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/13]⎯
 FAIL  src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Error Integration > should increment error count
AssertionError: expected undefined to be 1 // Object.is equality
- Expected: 
1
+ Received: 
undefined
 ❯ src/lib/__tests__/sessionTracking.test.ts:199:42
    197|       
    198|       const updatedSession = getCurrentSession();
    199|       expect(updatedSession?.errorCount).toBe(initialErrorCount + 1);
       |                                          ^
    200|     });
    201|   });
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/13]⎯
 FAIL  src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Data Persistence > should attempt to persist session data
AssertionError: expected "spy" to be called with arguments: [ 'jarvis_sessions', Any<String> ]
Number of calls: 0

 ❯ src/lib/__tests__/sessionTracking.test.ts:206:40
    204|     it('should attempt to persist session data', () => {
    205|       // Session tracking automatically persists data
    206|       expect(localStorageMock.setItem).toHaveBeenCalledWith(
       |                                        ^
    207|         'jarvis_sessions',
    208|         expect.any(String)
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/13]⎯
 FAIL  src/lib/__tests__/sessionTracking.test.ts > Session Tracking > Memory Management > should not leak memory with continuous usage
TypeError: actual value must be number or bigint, received "undefined"
 ❯ src/lib/__tests__/sessionTracking.test.ts:262:46
    260|       
    261|       // Should manage memory appropriately
    262|       expect(finalSession?.pageViews.length).toBeLessThan(initialPageV…
       |                                              ^
    263|     });
    264|   });
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/13]⎯
 FAIL  src/components/bug-report/__tests__/BugReportForm.test.tsx > BugReportForm > progresses through form steps correctly
TestingLibraryElementError: Found multiple elements with the text: Select Functionality
Here are the matching elements:
Ignored nodes: comments, script, style
<button>
  Select Functionality
</button>
Ignored nodes: comments, script, style
<button>
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
            <button>
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
            <button>
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
 ❯ src/components/bug-report/__tests__/BugReportForm.test.tsx:95:28
     93|     
     94|     // Step 1: Select bug type
     95|     fireEvent.click(screen.getByText('Select Functionality'));
       |                            ^
     96|     
     97|     // Should move to details step
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/13]⎯
 Test Files  2 failed | 21 passed | 17 skipped (40)
      Tests  13 failed | 391 passed | 31 skipped (525)
   Start at  05:33:49
   Duration  11.97s (transform 1.12s, setup 203ms, collect 1.87s, tests 8.89s, environment 440ms, prepare 180ms)
❌ Tests failed
🛑 Deployment cancelled due to test failures
Error: Process completed with exit code 1.