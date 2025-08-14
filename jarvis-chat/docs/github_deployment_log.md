Run echo "🧪 Running test suite..."
🧪 Running test suite...
> jarvis-chat@0.0.0 test:ci
> NODE_OPTIONS='--max-old-space-size=4096' vitest run --pool=forks --poolOptions.forks.singleFork=true --reporter=verbose --bail=10
 RUN  v3.2.4 /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat
 ✓ src/lib/__tests__/bugLifecycleIntegration.test.ts > Bug Lifecycle Integration Tests > Complete Bug Lifecycle Workflow > processes complete bug lifecycle from open to closed 10ms
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
(node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 4)
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
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should retry on retryable errors with fake timer advancement 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should not retry on non-retryable errors 1ms
(node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 11)
(node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 15)
(node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 19)
(node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 23)
(node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 28)
(node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 32)
(node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 34)
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should respect max attempts 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should calculate exponential backoff delays 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should not retry on 4xx client errors (except 408, 429) 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Retry Logic with Exponential Backoff > should retry on retryable HTTP status codes 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should open circuit after failure threshold with fake timers 4ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should reset circuit breaker on successful request 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should provide circuit breaker configuration methods 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Circuit Breaker Pattern > should allow manual circuit breaker reset 4ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Webhook Payload Validation > should validate required payload fields 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Webhook Payload Validation > should include optional payload fields when provided 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Webhook Payload Validation > should validate webhook response format strictly 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Performance and Metrics > should track request metrics 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Performance and Metrics > should track error metrics on failures 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Performance and Metrics > should calculate percentile response times 4ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Performance and Metrics > should include last request timestamp in metrics 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Health Check > should perform health check successfully 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Health Check > should return unhealthy status on errors 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Concurrent Request Handling > should handle multiple concurrent requests 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Concurrent Request Handling > should handle mixed success/failure in concurrent requests 3ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Authentication and Security > should include authorization header when secret is provided 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Authentication and Security > should include standard headers in all requests 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Authentication and Security > should generate unique request IDs 2ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Timer Management and Cleanup > should not have pending timers after operation completion 1ms
 ✓ src/lib/__tests__/webhookService.test.ts > WebhookService > Timer Management and Cleanup > should clean up resources on destroy 1ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should create webhook configuration with admin permissions 23ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should return 401 for missing admin permissions 4ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should validate webhook configuration 14ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should support different authentication types 10ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/webhooks > should support event filtering 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform pattern analysis 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform resolution analysis 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform severity classification 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform duplicate detection 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should perform user impact analysis 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should return 400 for invalid analysis type 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should return 404 for non-existent bug 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/claude-code/analyze/:bugId > should support analysis context options 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should setup Sentry integration with admin permissions 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should return 401 for missing admin permissions 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should validate Sentry configuration 4ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/sentry > should handle connection test failures 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should setup DataDog integration with admin permissions 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should return 401 for missing admin permissions 2ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should validate DataDog configuration 4ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > POST /api/integrations/datadog > should support different DataDog sites 8ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > GET /api/integrations/:id/status > should return integration status 9ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > GET /api/integrations/:id/status > should return 404 for non-existent integration 4ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > GET /api/integrations > should list all integrations with summary 11ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should format bug data for Sentry correctly 1ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should format bug data for DataDog correctly 1ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should format bug data for Slack correctly 15ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Webhook Delivery Service > should get delivery statistics 1ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Error Handling > should handle malformed webhook configurations 3ms
 ✓ src/services/__tests__/externalIntegration.test.ts > External Integration Service > Error Handling > should handle service unavailability gracefully 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should create export request with export permissions 5ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should return 401 for missing export permissions 6ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should validate export format 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should support all valid export formats 10ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should apply export templates 3ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports > should return 503 when export queue is full 10ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id > should return export status for valid export ID 4ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id > should return 404 for non-existent export ID 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id > should include progress for processing exports 105ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id/download > should download completed export file 508ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/:id/download > should return 400 for incomplete export 5ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should create scheduled export with admin permissions 5ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should return 401 for missing admin permissions 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should validate schedule configuration 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > POST /api/exports/scheduled > should support different schedule frequencies 5ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/templates > should return available export templates 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > GET /api/exports/templates > should filter templates by user access 2ms
 ✓ src/api/__tests__/bugExport.test.ts > Bug Export API > Export Processing > should handle large dataset exports 19ms
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
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Payload Schema Validation > should validate UUID format strictly 3ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Enhanced Webhook Payload Schema Validation > should validate enhanced payload with metadata 2ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Enhanced Webhook Payload Schema Validation > should apply default values for optional metadata fields 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Enhanced Webhook Payload Schema Validation > should validate tool selection metadata structure 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Response Schema Validation > should validate successful webhook response 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Response Schema Validation > should validate error webhook response 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Response Schema Validation > should reject response with invalid structure 3ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Webhook Response Schema Validation > should validate optional response fields 0ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Health Check Response Schema Validation > should validate healthy status response 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Health Check Response Schema Validation > should validate degraded status response 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Health Check Response Schema Validation > should reject invalid health status values 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Health Check Response Schema Validation > should validate minimal health check response 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Validation Error Schema > should create properly structured validation errors 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > WebhookValidator Utility Methods > should create validated payload with createValidatedPayload 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > WebhookValidator Utility Methods > should throw error for invalid payload construction 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > WebhookValidator Utility Methods > should provide validation summary 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > WebhookValidator Utility Methods > should provide detailed validation summary for invalid payload 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > WebhookValidator Utility Methods > should handle edge cases in validation summary 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Schema Integration Tests > should work with real-world payload example 1ms
 ✓ src/lib/__tests__/webhookValidation.test.ts > WebhookValidation > Schema Integration Tests > should handle complex validation error scenarios 1ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should return paginated bugs with valid API key 6ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should return 401 for invalid API key 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should return 401 for missing API key 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should apply status filters correctly 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should apply date range filters correctly 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs > should enforce pagination limits 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/:id > should return bug details with valid ID 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/:id > should return 404 for non-existent bug 5ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > PUT /api/bugs/:id/status > should update bug status with write permissions 4ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > PUT /api/bugs/:id/status > should return 400 for invalid status 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > PUT /api/bugs/:id/status > should return 401 for insufficient permissions 4ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/:id/assign > should assign bug with write permissions 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/:id/assign > should return 400 for failed assignment 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/search > should perform text search with results 4ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > POST /api/bugs/search > should return empty results for no matches 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/analytics > should return analytics data 4ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > GET /api/bugs/analytics > should use default time range when not specified 3ms
 ↓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Rate Limiting > should enforce rate limits
 ↓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Error Handling > should handle database errors gracefully
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Error Handling > should handle service errors gracefully 8ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Input Validation > should validate required fields for status updates 3ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Input Validation > should validate required fields for assignments 2ms
 ✓ src/api/__tests__/bugDashboard.test.ts > Bug Dashboard API > Input Validation > should validate pagination parameters 4ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should record successful requests correctly 4ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should record failed requests correctly 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should calculate percentiles correctly 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should track requests per minute and hour 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should determine health status based on metrics 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should handle empty metrics gracefully 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Performance Metrics Collection > should maintain performance history size limit 10ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should initialize with default alert rules 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should trigger high error rate alert 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should trigger slow response time alert 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should respect alert cooldown periods 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should allow custom alert rules 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should allow alert resolution 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert System > should generate descriptive alert messages 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Dashboard Data > should generate comprehensive dashboard data 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Dashboard Data > should include performance trends in dashboard data 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Dashboard Data > should limit recent alerts in dashboard data 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert Subscription Management > should allow multiple subscribers 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert Subscription Management > should handle subscriber errors gracefully 2ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Alert Subscription Management > should properly unsubscribe callbacks 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Circuit Breaker Integration > should infer circuit breaker state from error patterns 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Circuit Breaker Integration > should detect half-open circuit breaker state 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Circuit Breaker Integration > should show closed circuit breaker for healthy patterns 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Data Cleanup and Management > should clear history and alerts properly 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Data Cleanup and Management > should handle concurrent request recording safely 3ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Singleton Instance > should provide working singleton instance 1ms
 ✓ src/lib/__tests__/webhookMonitoring.test.ts > WebhookMonitoringService > Singleton Instance > should maintain state across singleton access 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > assigns bug to team member successfully 3ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > handles assignment to non-existent user 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > handles database update failures 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > tracks assignment history 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Manual Assignment > handles reassignment correctly 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Auto Assignment > auto-assigns bug successfully 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Auto Assignment > returns null when no suitable assignee found 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Auto Assignment > considers workload when auto-assigning 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Recommendations > generates assignment recommendations 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Recommendations > sorts recommendations by confidence 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Recommendations > considers skill matching in recommendations 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Priority Escalation > escalates bug priority successfully 3ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Priority Escalation > prevents escalation beyond maximum priority 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Priority Escalation > sends escalation alerts to managers 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > calculates workload metrics correctly 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > identifies workload imbalances 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > updates team member information 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Workload Management > handles update of non-existent team member 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Rules > applies assignment rules correctly 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Assignment Rules > falls back to recommendations when no rules match 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Error Handling > handles bug fetch errors gracefully 1ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Error Handling > handles notification failures gracefully 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Performance > handles concurrent assignments without conflicts 2ms
 ✓ src/lib/__tests__/assignmentSystem.test.ts > BugAssignmentSystem > Performance > maintains reasonable performance with large workload 3ms
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
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Development Environment > should validate complete development setup 5ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Development Environment > should allow insecure configurations in development 3ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Staging Environment > should validate complete staging setup 2ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Staging Environment > should enforce HTTPS in staging 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Production Environment > should validate complete production setup 2ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Production Environment > should reject insecure production configurations 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Complete Production Environment > should require HTTPS for all external services in production 1ms
 ✓ src/lib/__tests__/environment-integration.test.ts > Environment & Secrets Integration > Health Check Integration > should provide comprehensive health status 3ms
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
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Logging > should log secrets status without revealing values 1ms
 ✓ src/lib/__tests__/secrets-management.test.ts > Secrets Management System > Integration with Environment Validation > should complement environment validation 1ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Tracking > should track page load time 4ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Tracking > should track API response times 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Tracking > should track API errors for 4xx/5xx status codes 3ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Tracking > should track user interactions 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Custom Metrics > should track custom metrics with tags 3ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Custom Metrics > should track business events 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > User Tracking > should set user information 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Transactions > should create and finish transactions 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Transactions > should track transaction duration as metric 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Error Tracking > should capture exceptions 3ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Error Tracking > should capture messages with different levels 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Core Web Vitals > should collect Core Web Vitals 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Metrics Filtering > should filter metrics by name 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Metrics Filtering > should filter metrics by time range 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Health Monitoring > should report monitoring health status 3ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Health Monitoring > should report degraded status with many errors 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > External Integration > should handle missing external APM services gracefully 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > External Integration > should send to external services when available 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Memory Management > should limit metrics storage to prevent memory leaks 15ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Memory Management > should limit events storage to prevent memory leaks 7ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Wrapper > should wrap functions with monitoring 2ms
 ✓ src/lib/__tests__/monitoring.test.ts > MonitoringService > Performance Wrapper > should handle function errors and track them 3ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Message Sending Success Scenarios > should send message successfully with valid payload 4ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Message Sending Success Scenarios > should include request metadata in payload 2ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should throw validation error for missing webhook URL 2ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle HTTP error responses 302ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle network errors 304ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Error Handling > should handle malformed response format 3ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Basic Retry Logic > should retry on retryable errors and eventually succeed 303ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Basic Retry Logic > should not retry on non-retryable errors 3ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Webhook Payload Validation > should validate required payload fields 2ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Webhook Payload Validation > should include optional payload fields when provided 1ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Performance and Metrics > should track request metrics on success 1ms
 ✓ src/lib/__tests__/webhookService.basic.test.ts > WebhookService - Basic Tests > Performance and Metrics > should track error metrics on failures 302ms
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
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Breadcrumb System > should limit breadcrumb storage 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Breadcrumb System > should include breadcrumbs in error reports 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > API Failure Tracking > should track API failures with detailed context 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > API Failure Tracking > should add breadcrumbs for API failures 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Authentication Error Tracking > should track auth errors with context 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Authentication Error Tracking > should add breadcrumbs for auth events 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > User Action Tracking > should track user actions as breadcrumbs 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > User Action Tracking > should handle different action types 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Tags Management > should set and retrieve tags 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Tags Management > should merge tags when setting multiple times 3ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Tags Management > should include tags in error reports 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Session Integration > should include session ID in error reports 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Session Integration > should set user context 2ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Performance > should handle high volume of errors efficiently 56ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Performance > should limit stored errors to prevent memory leaks 120ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Data Persistence > should persist errors to localStorage 3ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Data Persistence > should persist breadcrumbs to localStorage 1ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > Data Persistence > should handle localStorage errors gracefully 3ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > External Monitoring Integration > should send errors to external monitoring asynchronously 29ms
 ✓ src/lib/__tests__/errorTracking.enhanced.test.ts > Enhanced Error Tracking > External Monitoring Integration > should send breadcrumbs to external monitoring 14ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > completes full bug report submission workflow 7ms
 × src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > integrates error tracking with bug reports 5ms
   → [Function addCorrelation] is not a spy or a call to a spy!
 × src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > integrates performance monitoring 4ms
   → [Function getCurrentMetrics] is not a spy or a call to a spy!
 × src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > handles validation errors properly 3ms
   → expected [ Array(1) ] to include 'Validation failed: Title must be at l…'
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > handles file upload failures gracefully 3ms
 × src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > detects and prevents duplicate submissions 2ms
   → Cannot read properties of undefined (reading 'mockResolvedValueOnce')
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > processes submission queue correctly 3ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > maintains data integrity throughout the process 2ms
 × src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > handles system errors and recovers gracefully 2ms
   → [Function trackBugReportError] is not a spy or a call to a spy!
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > generates proper tracking numbers 2ms
 ✓ src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > maintains performance under load 3ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Environment Template Files > should have .env.template for development 3ms
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
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Environment-Specific Differences > should have appropriate differences between environments 1ms
 ✓ src/lib/__tests__/config-templates.test.ts > Configuration Templates Validation > Documentation Quality > should have comprehensive comments 2ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should use webhook service with proper payload structure 3ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should handle webhook service errors gracefully 2ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should use fallback response when circuit breaker is open 1924ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should use fallback response when webhook URL not configured 1367ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should include conversation ID in webhook payload when provided 4ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Enhanced sendMessageToAI > should handle missing conversation ID gracefully 2ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Webhook Status Monitoring > should return webhook health status and metrics 3ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Webhook Status Monitoring > should handle health check errors gracefully 2ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Webhook Status Monitoring > should detect when webhook is not configured 2ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Integration with Existing Features > should maintain backward compatibility with existing methods 2ms
 ✓ src/lib/__tests__/chatService.enhanced.test.ts > ChatService - Enhanced Integration > Integration with Existing Features > should pass conversation ID to enhanced webhook service 2ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > initialization > should initialize with default tools when user is not logged in 16ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > initialization > should load saved preferences from localStorage when user is logged in 6ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > tool selection > should toggle tool selection correctly 6ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > tool selection > should save selections to localStorage when changed 6ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > getSelectedToolIds > should return only enabled tool IDs 5ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > preferences management > should update preferences correctly 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > resetToDefaults > should reset to default selections and preferences 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > error handling > should handle localStorage errors gracefully 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > analytics > should generate session ID when recording usage 4ms
 ✓ src/hooks/__tests__/useTools.test.ts > useTools > analytics > should not record usage when analytics is disabled 6ms
 × src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > rendering > should render the tools button with correct selected count 43ms
   → Found multiple elements by: [data-testid="badge"]
Here are the matching elements:
Ignored nodes: comments, script, style
<span
  data-testid="badge"
  data-variant="secondary"
>
  1
</span>
Ignored nodes: comments, script, style
<span
  data-testid="badge"
  data-variant="outline"
>
  1
   selected
</span>
(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).
Ignored nodes: comments, script, style
<body>
  <div>
    <div
      data-open="false"
      data-testid="dropdown-menu"
    >
      <div
        data-testid="dropdown-trigger"
      >
        <button
          aria-label="Select tools (1 selected)"
          data-testid="tools-button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-settings h-4 w-4"
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
            <path
              d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
            />
          </svg>
          <span
            class="ml-2"
          >
            Tools
          </span>
          <span
            data-testid="badge"
            data-variant="secondary"
          >
            1
          </span>
          <svg
            aria-hidden="true"
            class="lucide lucide-chevron-down h-3 w-3 ml-1 opacity-50"
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
            <path
              d="m6 9 6 6 6-6"
            />
          </svg>
        </button>
      </div>
      <div
        data-testid="dropdown-content"
      >
        <div
          data-testid="dropdown-label"
        >
          <span>
            Available Tools
          </span>
          <span
            data-testid="badge"
            data-variant="outline"
          >
            1
             selected
          </span>
        </div>
        <div
          data-testid="dropdown-separator"
        />
        <div>
          <div
            data-testid="dropdown-label"
          >
            analysis
          </div>
          <div
            data-checked="true"
            data-testid="dropdown-checkbox-item"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-file-text h-4 w-4 mt-0.5 flex-shrink-0"
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
              <path
                d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
              />
              <path
                d="M14 2v4a2 2 0 0 0 2 2h4"
              />
              <path
                d="M10 9H8"
              />
              <path
                d="M16 13H8"
              />
              <path
                d="M16 17H8"
              />
            </svg>
            <div
              class="flex-1 min-w-0"
            >
              <div
                class="font-medium text-sm"
              >
                File Analysis
              </div>
              <div
                class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
              >
                Analyze uploaded documents and files
              </div>
            </div>
          </div>
          <div
            data-checked="false"
            data-testid="dropdown-checkbox-item"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-chart-no-axes-column-increasing h-4 w-4 mt-0.5 flex-shrink-0"
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
              <line
                x1="12"
                x2="12"
                y1="20"
                y2="10"
              />
              <line
                x1="18"
                x2="18"
                y1="20"
                y2="4"
              />
              <line
                x1="6"
                x2="6"
                y1="20"
                y2="16"
              />
            </svg>
            <div
              class="flex-1 min-w-0"
            >
              <div
                class="font-medium text-sm"
              >
                Data Analysis
              </div>
              <div
                class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
              >
                Analyze and visualize data patterns
              </div>
            </div>
          </div>
        </div>
        <div>
          <div
            data-testid="dropdown-separator"
          />
          <div
            data-testid="dropdown-label"
          >
            creative
          </div>
          <div
            data-checked="false"
            data-testid="dropdown-checkbox-item"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-image h-4 w-4 mt-0.5 flex-shrink-0"
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
                height="18"
                rx="2"
                ry="2"
                width="18"
                x="3"
                y="3"
              />
              <circle
                cx="9"
                cy="9"
                r="2"
              />
              <path
                d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
              />
            </svg>
            <div
              class="flex-1 min-w-0"
            >
              <div
                class="font-medium text-sm"
              >
                Image Generation
              </div>
              <div
                class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
              >
                Create and edit images with AI
              </div>
            </div>
          </div>
        </div>
        <div>
          <div
            data-testid="dropdown-separator"
          />
          <div
            data-testid="dropdown-label"
          >
            productivity
          </div>
          <div
            data-checked="false"
            data-testid="dropdown-checkbox-item"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-zap h-4 w-4 mt-0.5 flex-shrink-0"
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
              <path
                d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
              />
            </svg>
            <div
              class="flex-1 min-w-0"
            >
              <div
                class="font-medium text-sm"
              >
                Task Automation
              </div>
              <div
                class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
              >
                Automate repetitive tasks and workflows
              </div>
            </div>
          </div>
        </div>
        <div>
          <div
            data-testid="dropdown-separator"
          />
          <div
            data-testid="dropdown-label"
          >
            research
          </div>
          <div
            data-checked="false"
            data-testid="dropdown-checkbox-item"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-search h-4 w-4 mt-0.5 flex-shrink-0"
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
              <path
                d="m21 21-4.34-4.34"
              />
              <circle
                cx="11"
                cy="11"
                r="8"
              />
            </svg>
            <div
              class="flex-1 min-w-0"
            >
              <div
                class="font-medium text-sm"
              >
                Web Search
              </div>
              <div
                class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
              >
                Search the internet for current information
              </div>
            </div>
          </div>
        </div>
        <div>
          <div
            data-testid="dropdown-separator"
          />
          <div
            data-testid="dropdown-label"
          >
            technical
          </div>
          <div
            data-checked="false"
            data-testid="dropdown-checkbox-item"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-code h-4 w-4 mt-0.5 flex-shrink-0"
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
              <path
                d="m16 18 6-6-6-6"
              />
              <path
                d="m8 6-6 6 6 6"
              />
            </svg>
            <div
              class="flex-1 min-w-0"
            >
              <div
                class="font-medium text-sm"
              >
                Code Review
              </div>
              <div
                class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
              >
                Review and analyze code for improvements
              </div>
            </div>
          </div>
        </div>
        <div
          data-testid="dropdown-separator"
        />
        <div
          class="px-3 py-2 text-xs text-muted-foreground"
        >
          Selected tools will be available to the AI assistant for enhanced responses.
        </div>
      </div>
    </div>
  </div>
</body>
 × src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > rendering > should render compact version correctly 17ms
   → expect(element).toHaveTextContent()
Expected element to have text content:
  2
Received:
  1
 × src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > rendering > should show loading state 14ms
   → Found multiple elements by: [data-testid="tools-button"]
Here are the matching elements:
Ignored nodes: comments, script, style
<button
  aria-label="Select tools (1 selected)"
  data-testid="tools-button"
>
  <svg
    aria-hidden="true"
    class="lucide lucide-settings h-4 w-4"
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
    <path
      d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
    />
  </svg>
  <span
    class="ml-2"
  >
    Tools
  </span>
  <span
    data-testid="badge"
    data-variant="secondary"
  >
    1
  </span>
  <svg
    aria-hidden="true"
    class="lucide lucide-chevron-down h-3 w-3 ml-1 opacity-50"
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
    <path
      d="m6 9 6 6 6-6"
    />
  </svg>
</button>
Ignored nodes: comments, script, style
<button
  aria-label="Select tools (2 selected)"
  data-testid="tools-button"
>
  <svg
    aria-hidden="true"
    class="lucide lucide-settings h-4 w-4"
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
    <path
      d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
    />
  </svg>
  <span
    data-testid="badge"
    data-variant="secondary"
  >
    2
  </span>
  <svg
    aria-hidden="true"
    class="lucide lucide-chevron-down h-3 w-3 ml-1 opacity-50"
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
    <path
      d="m6 9 6 6 6-6"
    />
  </svg>
</button>
Ignored nodes: comments, script, style
<button
  data-testid="tools-button"
  disabled=""
>
  <svg
    aria-hidden="true"
    class="lucide lucide-settings h-4 w-4 animate-spin"
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
    <path
      d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
    />
  </svg>
  <span
    class="ml-2"
  >
    Loading...
  </span>
</button>
(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).
Ignored nodes: comments, script, style
<body>
  <div>
    <div
      data-open="false"
      data-testid="dropdown-menu"
    >
      <div
        data-testid="dropdown-trigger"
      >
        <button
          aria-label="Select tools (1 selected)"
          data-testid="tools-button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-settings h-4 w-4"
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
            <path
              d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
            />
          </svg>
          <span
            class="ml-2"
          >
            Tools
          </span>
          <span
            data-testid="badge"
            data-variant="secondary"
          >
            1
          </span>
          <svg
            aria-hidden="true"
            class="lucide lucide-chevron-down h-3 w-3 ml-1 opacity-50"
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
            <path
              d="m6 9 6 6 6-6"
            />
          </svg>
        </button>
      </div>
      <div
        data-testid="dropdown-content"
      >
        <div
          data-testid="dropdown-label"
        >
          <span>
            Available Tools
          </span>
          <span
            data-testid="badge"
            data-variant="outline"
          >
            1
             selected
          </span>
        </div>
        <div
          data-testid="dropdown-separator"
        />
        <div>
          <div
            data-testid="dropdown-label"
          >
            analysis
          </div>
          <div
            data-checked="true"
            data-testid="dropdown-checkbox-item"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-file-text h-4 w-4 mt-0.5 flex-shrink-0"
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
              <path
                d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
              />
              <path
                d="M14 2v4a2 2 0 0 0 2 2h4"
              />
              <path
                d="M10 9H8"
              />
              <path
                d="M16 13H8"
              />
              <path
                d="M16 17H8"
              />
            </svg>
            <div
              class="flex-1 min-w-0"
            >
              <div
                class="font-medium text-sm"
              >
                File Analysis
              </div>
              <div
                class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
              >
                Analyze uploaded documents and files
              </div>
            </div>
          </div>
          <div
            data-checked="false"
            data-testid="dropdown-checkbox-item"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-chart-no-axes-column-increasing h-4 w-4 mt-0.5 flex-shrink-0"
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
              <line
                x1="12"
                
 × src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > tool selection > should toggle tool selection when checkbox is clicked 31ms
   → Found multiple elements by: [data-testid="dropdown-menu"]
Here are the matching elements:
Ignored nodes: comments, script, style
<div
  data-open="false"
  data-testid="dropdown-menu"
>
  <div
    data-testid="dropdown-trigger"
  >
    <button
      aria-label="Select tools (1 selected)"
      data-testid="tools-button"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-settings h-4 w-4"
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
        <path
          d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        />
        <circle
          cx="12"
          cy="12"
          r="3"
        />
      </svg>
      <span
        class="ml-2"
      >
        Tools
      </span>
      <span
        data-testid="badge"
        data-variant="secondary"
      >
        1
      </span>
      <svg
        aria-hidden="true"
        class="lucide lucide-chevron-down h-3 w-3 ml-1 opacity-50"
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
        <path
          d="m6 9 6 6 6-6"
        />
      </svg>
    </button>
  </div>
  <div
    data-testid="dropdown-content"
  >
    <div
      data-testid="dropdown-label"
    >
      <span>
        Available Tools
      </span>
      <span
        data-testid="badge"
        data-variant="outline"
      >
        1
         selected
      </span>
    </div>
    <div
      data-testid="dropdown-separator"
    />
    <div>
      <div
        data-testid="dropdown-label"
      >
        analysis
      </div>
      <div
        data-checked="true"
        data-testid="dropdown-checkbox-item"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-file-text h-4 w-4 mt-0.5 flex-shrink-0"
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
          <path
            d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
          />
          <path
            d="M14 2v4a2 2 0 0 0 2 2h4"
          />
          <path
            d="M10 9H8"
          />
          <path
            d="M16 13H8"
          />
          <path
            d="M16 17H8"
          />
        </svg>
        <div
          class="flex-1 min-w-0"
        >
          <div
            class="font-medium text-sm"
          >
            File Analysis
          </div>
          <div
            class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
          >
            Analyze uploaded documents and files
          </div>
        </div>
      </div>
      <div
        data-checked="false"
        data-testid="dropdown-checkbox-item"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-chart-no-axes-column-increasing h-4 w-4 mt-0.5 flex-shrink-0"
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
          <line
            x1="12"
            x2="12"
            y1="20"
            y2="10"
          />
          <line
            x1="18"
            x2="18"
            y1="20"
            y2="4"
          />
          <line
            x1="6"
            x2="6"
            y1="20"
            y2="16"
          />
        </svg>
        <div
          class="flex-1 min-w-0"
        >
          <div
            class="font-medium text-sm"
          >
            Data Analysis
          </div>
          <div
            class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
          >
            Analyze and visualize data patterns
          </div>
        </div>
      </div>
    </div>
    <div>
      <div
        data-testid="dropdown-separator"
      />
      <div
        data-testid="dropdown-label"
      >
        creative
      </div>
      <div
        data-checked="false"
        data-testid="dropdown-checkbox-item"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-image h-4 w-4 mt-0.5 flex-shrink-0"
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
            height="18"
            rx="2"
            ry="2"
            width="18"
            x="3"
            y="3"
          />
          <circle
            cx="9"
            cy="9"
            r="2"
          />
          <path
            d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
          />
        </svg>
        <div
          class="flex-1 min-w-0"
        >
          <div
            class="font-medium text-sm"
          >
            Image Generation
          </div>
          <div
            class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
          >
            Create and edit images with AI
          </div>
        </div>
      </div>
    </div>
    <div>
      <div
        data-testid="dropdown-separator"
      />
      <div
        data-testid="dropdown-label"
      >
        productivity
      </div>
      <div
        data-checked="false"
        data-testid="dropdown-checkbox-item"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-zap h-4 w-4 mt-0.5 flex-shrink-0"
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
          <path
            d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
          />
        </svg>
        <div
          class="flex-1 min-w-0"
        >
          <div
            class="font-medium text-sm"
          >
            Task Automation
          </div>
          <div
            class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
          >
            Automate repetitive tasks and workflows
          </div>
        </div>
      </div>
    </div>
    <div>
      <div
        data-testid="dropdown-separator"
      />
      <div
        data-testid="dropdown-label"
      >
        research
      </div>
      <div
        data-checked="false"
        data-testid="dropdown-checkbox-item"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-search h-4 w-4 mt-0.5 flex-shrink-0"
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
          <path
            d="m21 21-4.34-4.34"
          />
          <circle
            cx="11"
            cy="11"
            r="8"
          />
        </svg>
        <div
          class="flex-1 min-w-0"
        >
          <div
            class="font-medium text-sm"
          >
            Web Search
          </div>
          <div
            class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
          >
            Search the internet for current information
          </div>
        </div>
      </div>
    </div>
    <div>
      <div
        data-testid="dropdown-separator"
      />
      <div
        data-testid="dropdown-label"
      >
        technical
      </div>
      <div
        data-checked="false"
        data-testid="dropdown-checkbox-item"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-code h-4 w-4 mt-0.5 flex-shrink-0"
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
          <path
            d="m16 18 6-6-6-6"
          />
          <path
            d="m8 6-6 6 6 6"
          />
        </svg>
        <div
          class="flex-1 min-w-0"
        >
          <div
            class="font-medium text-sm"
          >
            Code Review
          </div>
          <div
            class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
          >
            Review and analyze code for improvements
          </div>
        </div>
      </div>
    </div>
    <div
      data-testid="dropdown-separator"
    />
    <div
      class="px-3 py-2 text-xs text-muted-foreground"
    >
      Selected tools will be available to the AI assistant for enhanced responses.
    </div>
  </div>
</div>
Ignored nodes: comments, script, style
<div
  data-open="false"
  data-testid="dropdown-menu"
>
  <div
    data-testid="dropdown-trigger"
  >
    <button
      aria-label="Select tools (2 selected)"
      data-testid="tools-button"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-settings h-4 w-4"
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
        <path
          d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        />
        <circle
          cx="12"
          cy="12"
          r="3"
        />
      </svg>
      <span
        data-testid="badge"
        data-variant="secondary"
      >
        2
      </span>
      <svg
        aria-hidden="true"
        class="lucide lucide-chevron-down h-3 w-3 ml-1 opacity-50"
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
        <path
          d="m6 9 6 6 6-6"
        />
      </svg>
    </button>
  </div>
  <div
    data-testid="dropdown-content"
  >
    <div
      data-testid="dropdown-label"
    >
      <span>
        Available Tools
      </span>
      <span
        data-testid="badge"
        data-variant="outline"
      >
        2
         selected
      </span>
    </div>
    <div
      data-testid="dropdown-separator"
    />
    <div>
      <div
        data-testid="dropdown-label"
      >
        analysis
      </div>
      <div
        data-checked="true"
        data-testid="dropdown-checkbox-item"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-file-text h-4 w-4 mt-0.5 flex-shrink-0"
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
          <path
            d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
          />
          <path
            d="M14 2v4a2 2 0 0 0 2 2h4"
          />
          <path
            d="M10 9H8"
          />
          <path
            d="M16 13H8"
          />
          <path
            d="M16 17H8"
          />
        </svg>
        <div
          class="flex-1 min-w-0"
        >
          <div
            class="font-medium text-sm"
          >
            File Analysis
          </div>
          <div
            class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
          >
            Analyze uploaded documents and files
          </div>
        </div>
      </div>
      <div
        data-checked="false"
        data-testid="dropdown-checkbox-item"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-chart-no-axes-column-increasing h-4 w-4 mt-0.5 flex-shrink-0"
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
          <line
            x1="12"
            x2="12"
            y1="20"
            y2="10"
          />
          <line
            x1="18"
            x2="18"
            y1="20"
            y2="4"
          />
          <line
            x1="6"
            x2="6"
            y1="20"
            y2="16"
          />
        </svg>
        <div
          class="flex-1 min-w-0"
        >
          <div
            class="font-medium text-sm"
          >
            Data Analysis
          </div>
          <div
            class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
          >
            Analyze and visualize data patterns
          </div>
        </div>
      </div>
    </div>
    <div>
      <div
        data-testid="dropdown-separator"
      />
      <div
        data-testid="dropdown-label"
      >
        creative
      </div>
      <div
        data-checked="false"
        data-testid="dropdown-checkbox-item"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-image h-4 w-4 mt-0.5 flex-shrink-0"
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
            height="18"
            rx="2"
            ry="2"
            width="18"
            x="3"
            y="3"
          />
          <circle
            cx="9"
            cy="9"
            r="2"
          />
          <path
            d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
          />
        </svg>
        <div
          class="flex-1 min-w-0"
        >
          <div
            class="font-medium text-sm"
          >
            Image Generation
          </div>
          <div
            class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
          >
            Create and edit images with AI
          </div>
        </div>
      </div>
    </div>
    <div>
      <div
        data-testid="dropdown-separator"
      />
      <div
        data-testid="dropdown-label"
      >
        productivity
      </div>
      <div
        data-checked="false"
        data-testid="dropdown-checkbox-item"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-zap h-4 w-4 mt-0.5 flex-shrink-0"
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
          <path
            d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
          />
        </svg>
        <div
          class="flex-1 min-w-0"
        >
          <div
            class="font-medium text-sm"
          >
            Task Automation
          </div>
          <div
            class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
          >
            Automate repetitive tasks and workflows
          </div>
        </div>
      </div>
    </div>
    <div>
      <div
        data-testid="dropdown-separator"
      />
      <div
        data-testid="dropdown-label"
      >
        research
      </div>
      <div
        data-checked="false"
        data-testid="dropdown-checkbox-item"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-search h-4 w-4 mt-0.5 flex-shrink-0"
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
          <path
            d="m21 21-4.34-4.34"
          />
          <circle
            cx="11"
            cy="11"
            r="8"
          />
        </svg>
        <div
          class="flex-1 min-w-0"
        >
          <div
            class="font-medium text-sm"
          >
            Web Search
          </div>
          <div
            class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
          >
            Search the internet for current information
          </div>
        </div>
      </div>
    </div>
    <div>
      <div
        data-testid="dropdown-separator"
      />
      <div
        data-testid="dropdown-label"
      >
        technical
      </div>
      <div
        data-checked="false"
        data-testid="dropdown-checkbox-item"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-code h-4 w-4 mt-0.5 flex-shrink-0"
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
          <path
            d="m16 18 6-6-6-6"
          />
          <path
            d="m8 6-6 6 6 6"
          />
        </svg>
        <div
          class="flex-1 min-w-0"
        >
          <div
            class="font-medium text-sm"
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
⎯⎯⎯⎯⎯⎯ Failed Tests 10 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > integrates error tracking with bug reports
TypeError: [Function addCorrelation] is not a spy or a call to a spy!
 ❯ src/__tests__/bugReportIntegration.test.ts:137:41
    135| 
    136|     // Verify error correlation was added
    137|     expect(errorTracker.addCorrelation).toHaveBeenCalled();
       |                                         ^
    138| 
    139|     // Verify recent errors were collected
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/10]⎯
 FAIL  src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > integrates performance monitoring
TypeError: [Function getCurrentMetrics] is not a spy or a call to a spy!
 ❯ src/__tests__/bugReportIntegration.test.ts:149:50
    147| 
    148|     // Verify performance metrics were collected
    149|     expect(performanceMetrics.getCurrentMetrics).toHaveBeenCalled();
       |                                                  ^
    150| 
    151|     // Verify monitoring events were tracked
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/10]⎯
 FAIL  src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > handles validation errors properly
AssertionError: expected [ Array(1) ] to include 'Validation failed: Title must be at l…'
 ❯ src/__tests__/bugReportIntegration.test.ts:170:27
    168| 
    169|     expect(result.success).toBe(false);
    170|     expect(result.errors).toContain('Validation failed: Title must be …
       |                           ^
    171| 
    172|     // Verify error was logged
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/10]⎯
 FAIL  src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > detects and prevents duplicate submissions
TypeError: Cannot read properties of undefined (reading 'mockResolvedValueOnce')
 ❯ src/__tests__/bugReportIntegration.test.ts:215:51
    213|     // Mock search to return similar bug report
    214|     const { bugReportOperations } = await import('@/lib/supabase');
    215|     vi.mocked(bugReportOperations.searchBugReports).mockResolvedValueO…
       |                                                   ^
    216|       data: [{
    217|         id: 'existing-bug-id',
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/10]⎯
 FAIL  src/__tests__/bugReportIntegration.test.ts > Bug Report System Integration > handles system errors and recovers gracefully
TypeError: [Function trackBugReportError] is not a spy or a call to a spy!
 ❯ src/__tests__/bugReportIntegration.test.ts:298:44
    296| 
    297|     // Verify error tracking
    298|     expect(vi.mocked(trackBugReportError)).toHaveBeenCalledWith(
       |                                            ^
    299|       'System temporarily unavailable',
    300|       expect.any(Object)
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/10]⎯
 FAIL  src/components/chat/__tests__/ToolsSelector.test.tsx > ToolsSelector > rendering > should render the tools button with correct selected count
TestingLibraryElementError: Found multiple elements by: [data-testid="badge"]
Here are the matching elements:
Ignored nodes: comments, script, style
<span
  data-testid="badge"
  data-variant="secondary"
>
  1
</span>
Ignored nodes: comments, script, style
<span
  data-testid="badge"
  data-variant="outline"
>
  1
   selected
</span>
(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).
Ignored nodes: comments, script, style
<body>
  <div>
    <div
      data-open="false"
      data-testid="dropdown-menu"
    >
      <div
        data-testid="dropdown-trigger"
      >
        <button
          aria-label="Select tools (1 selected)"
          data-testid="tools-button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-settings h-4 w-4"
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
            <path
              d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
            />
          </svg>
          <span
            class="ml-2"
          >
            Tools
          </span>
          <span
            data-testid="badge"
            data-variant="secondary"
          >
            1
          </span>
          <svg
            aria-hidden="true"
            class="lucide lucide-chevron-down h-3 w-3 ml-1 opacity-50"
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
            <path
              d="m6 9 6 6 6-6"
            />
          </svg>
        </button>
      </div>
      <div
        data-testid="dropdown-content"
      >
        <div
          data-testid="dropdown-label"
        >
          <span>
            Available Tools
          </span>
          <span
            data-testid="badge"
            data-variant="outline"
          >
            1
             selected
          </span>
        </div>
        <div
          data-testid="dropdown-separator"
        />
        <div>
          <div
            data-testid="dropdown-label"
          >
            analysis
          </div>
          <div
            data-checked="true"
            data-testid="dropdown-checkbox-item"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-file-text h-4 w-4 mt-0.5 flex-shrink-0"
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
              <path
                d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
              />
              <path
                d="M14 2v4a2 2 0 0 0 2 2h4"
              />
              <path
                d="M10 9H8"
              />
              <path
                d="M16 13H8"
              />
              <path
                d="M16 17H8"
              />
            </svg>
            <div
              class="flex-1 min-w-0"
            >
              <div
                class="font-medium text-sm"
              >
                File Analysis
              </div>
              <div
                class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
              >
                Analyze uploaded documents and files
              </div>
            </div>
          </div>
          <div
            data-checked="false"
            data-testid="dropdown-checkbox-item"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-chart-no-axes-column-increasing h-4 w-4 mt-0.5 flex-shrink-0"
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
              <line
                x1="12"
                x2="12"
                y1="20"
                y2="10"
              />
              <line
                x1="18"
                x2="18"
                y1="20"
                y2="4"
              />
              <line
                x1="6"
                x2="6"
                y1="20"
                y2="16"
              />
            </svg>
            <div
              class="flex-1 min-w-0"
            >
              <div
                class="font-medium text-sm"
              >
                Data Analysis
              </div>
              <div
                class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
              >
                Analyze and visualize data patterns
              </div>
            </div>
          </div>
        </div>
        <div>
          <div
            data-testid="dropdown-separator"
          />
          <div
            data-testid="dropdown-label"
          >
            creative
          </div>
          <div
            data-checked="false"
            data-testid="dropdown-checkbox-item"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-image h-4 w-4 mt-0.5 flex-shrink-0"
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
                height="18"
                rx="2"
                ry="2"
                width="18"
                x="3"
                y="3"
              />
              <circle
                cx="9"
                cy="9"
                r="2"
              />
              <path
                d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
              />
            </svg>
            <div
              class="flex-1 min-w-0"
            >
              <div
                class="font-medium text-sm"
              >
                Image Generation
              </div>
              <div
                class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
              >
                Create and edit images with AI
              </div>
            </div>
          </div>
        </div>
        <div>
          <div
            data-testid="dropdown-separator"
          />
          <div
            data-testid="dropdown-label"
          >
            productivity
          </div>
          <div
            data-checked="false"
            data-testid="dropdown-checkbox-item"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-zap h-4 w-4 mt-0.5 flex-shrink-0"
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
              <path
                d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
              />
            </svg>
            <div
              class="flex-1 min-w-0"
            >
              <div
                class="font-medium text-sm"
              >
                Task Automation
              </div>
              <div
                class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
              >
                Automate repetitive tasks and workflows
              </div>
            </div>
          </div>
        </div>
        <div>
          <div
            data-testid="dropdown-separator"
          />
          <div
            data-testid="dropdown-label"
          >
            research
          </div>
          <div
            data-checked="false"
            data-testid="dropdown-checkbox-item"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-search h-4 w-4 mt-0.5 flex-shrink-0"
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
              <path
                d="m21 21-4.34-4.34"
              />
              <circle
                cx="11"
                cy="11"
                r="8"
              />
            </svg>
            <div
              class="flex-1 min-w-0"
            >
              <div
                class="font-medium text-sm"
              >
                Web Search
              </div>
              <div
                class="text-xs text-muted-foreground mt-0.5 leading-relaxed"
              >
                Search the internet for current information
              </div>
            </div>
          </div>
        </div>
        <div>
          <div
            data-testid="dropdown-separator"
          />
          <div
            data-testid="dropdown-label"
          >
            technical
          </div>
          <div
            data-checked="false"
            data-testid="dropdown-checkbox-item"
          >
            <svg
              aria-hidden="true"
  >
    <button
      aria-label="Select tools (1 selected)"
      data-testid="tools-button"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-settings h-4 w-4"
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
        <path
          d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        />
        <circle
          cx="12"
          cy="12"
          r="3"
        />
      </svg>
      <span
        class="ml-2"
      >
        Tools
      </span>
      <span
        data-testid="badge"
        data-variant="secondary"
      >
        1
      </span>
      <svg
        aria-hidden="true"
        class="lucide lucide-chevron-down h-3 w-3 ml-1 opacity-50"
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
        <path
          d="m6 9 6 6 6-6"
        />
      </svg>
    </button>
  </div>
  <div
    data-testid="dropdown-content"
  >
    <div
      data-testid="dropdown-label"
    >
      <span>
        Available Tools
      </span>
      <span
        data-testid="badge"
        data-variant="outline"
      >
        1
         selected
      </span>
    </div>
    <div
      data-testid="dropdown-separator"
    />
    <div>
      <div
        data-testid="dropdown-label"
      >
        analysis
      </div>
      <div
        data-checked="true"
        data-testid="dropdown-checkbox-item"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-file-text h-4 w-4 mt-0.5 flex-shrink-0"
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
          <path
            d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
          />
          <path
            d="M14 2v4a2 2 0 0 0 2 2h4"
          />
          <path
            d="M10 9H8"
          />
          <path
            d="M16 13H8"
          />
          <path
            d="M16 17H8"
          />
        </svg>
        <div
          class="flex-1 min-w-0"
        >
          <div
            class="font-medium text-sm"
          >
            File Analysis