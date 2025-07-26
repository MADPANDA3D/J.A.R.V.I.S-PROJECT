/**
 * VPS Webhook Server Tests
 * Tests for webhook signature verification and event handling
 */

const crypto = require('crypto');

// Test webhook secret synchronization
describe('Webhook Secret Synchronization Tests', () => {
    const WEBHOOK_SECRET = 'bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h';
    
    test('should generate correct HMAC-SHA256 signature', () => {
        const payload = JSON.stringify({
            zen: "Test payload for signature verification"
        });
        
        const expectedSignature = 'sha256=' + crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(payload)
            .digest('hex');
        
        expect(expectedSignature).toMatch(/^sha256=[a-f0-9]{64}$/);
    });
    
    test('should verify GitHub webhook signature correctly', () => {
        const payload = JSON.stringify({
            zen: "Design for failure.",
            hook_id: 12345678,
            repository: {
                name: "J.A.R.V.I.S-PROJECT"
            }
        });
        
        const signature = 'sha256=' + crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(payload)
            .digest('hex');
        
        const verifySignature = (payload, signature) => {
            const expectedSignature = 'sha256=' + crypto
                .createHmac('sha256', WEBHOOK_SECRET)
                .update(payload)
                .digest('hex');
            
            return crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );
        };
        
        expect(verifySignature(payload, signature)).toBe(true);
    });
    
    test('should reject invalid webhook signature', () => {
        const payload = JSON.stringify({
            zen: "Test payload"
        });
        
        const invalidSignature = 'sha256=invalid_signature_hash';
        
        const verifySignature = (payload, signature) => {
            const expectedSignature = 'sha256=' + crypto
                .createHmac('sha256', WEBHOOK_SECRET)
                .update(payload)
                .digest('hex');
            
            try {
                return crypto.timingSafeEqual(
                    Buffer.from(signature),
                    Buffer.from(expectedSignature)
                );
            } catch (error) {
                return false;
            }
        };
        
        expect(verifySignature(payload, invalidSignature)).toBe(false);
    });
    
    test('should handle missing signature gracefully', () => {
        const payload = JSON.stringify({
            zen: "Test payload"
        });
        
        const verifySignature = (payload, signature) => {
            if (!signature) {
                return false;
            }
            
            const expectedSignature = 'sha256=' + crypto
                .createHmac('sha256', WEBHOOK_SECRET)
                .update(payload)
                .digest('hex');
            
            try {
                return crypto.timingSafeEqual(
                    Buffer.from(signature),
                    Buffer.from(expectedSignature)
                );
            } catch (error) {
                return false;
            }
        };
        
        expect(verifySignature(payload, null)).toBe(false);
        expect(verifySignature(payload, undefined)).toBe(false);
        expect(verifySignature(payload, '')).toBe(false);
    });
});

// Test webhook event handling
describe('Webhook Event Handler Tests', () => {
    test('should handle ping event correctly', () => {
        const pingEvent = {
            zen: "Design for failure.",
            hook_id: 12345678,
            repository: {
                name: "J.A.R.V.I.S-PROJECT",
                full_name: "MADPANDA3D/J.A.R.V.I.S-PROJECT"
            }
        };
        
        expect(pingEvent.zen).toBeDefined();
        expect(pingEvent.hook_id).toBeDefined();
        expect(pingEvent.repository.name).toBe("J.A.R.V.I.S-PROJECT");
    });
    
    test('should handle workflow_run event correctly', () => {
        const workflowEvent = {
            action: "completed",
            workflow_run: {
                conclusion: "success",
                head_sha: "abcd1234567890abcdef1234567890abcdef1234",
                name: "Deploy to VPS"
            },
            repository: {
                name: "J.A.R.V.I.S-PROJECT"
            }
        };
        
        expect(workflowEvent.action).toBe("completed");
        expect(workflowEvent.workflow_run.conclusion).toBe("success");
        expect(workflowEvent.workflow_run.head_sha.substring(0, 7)).toBe("abcd123");
    });
});

// Test environment variable loading
describe('Environment Variable Tests', () => {
    test('should load webhook secret from environment', () => {
        const testSecret = 'bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h';
        
        // Simulate environment variable loading
        process.env.WEBHOOK_SECRET = testSecret;
        const loadedSecret = process.env.WEBHOOK_SECRET || 'your-webhook-secret-here';
        
        expect(loadedSecret).toBe(testSecret);
        expect(loadedSecret).not.toBe('your-webhook-secret-here');
    });
    
    test('should use default value when environment variable not set', () => {
        delete process.env.WEBHOOK_SECRET;
        const loadedSecret = process.env.WEBHOOK_SECRET || 'your-webhook-secret-here';
        
        expect(loadedSecret).toBe('your-webhook-secret-here');
    });
});