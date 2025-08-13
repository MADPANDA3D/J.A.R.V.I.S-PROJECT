// Test the exact scenario from the failing test

// Mock the test scenario
const mockResponse = {
  ok: true,
  status: 200,
  json: () => Promise.resolve({ invalid: 'response' })
};

console.log('=== Testing webhook response handling logic ===');

// Step 1: Response guard logic
const hasOk = typeof mockResponse?.ok === 'boolean';
const hasStatus = typeof mockResponse?.status === 'number';

console.log('Step 1 - Response guard:');
console.log('- hasOk:', hasOk);
console.log('- hasStatus:', hasStatus);

const ok = hasOk ? mockResponse.ok
         : hasStatus ? (mockResponse.status >= 200 && mockResponse.status < 300)
         : undefined;

console.log('- computed ok:', ok);

// Step 2: Check malformed response condition
const shouldThrowMalformed = ok === undefined && !hasStatus;
console.log('- shouldThrowMalformed:', shouldThrowMalformed);

// Step 3: Check HTTP error condition
const shouldThrowHttpError = ok === false || (hasStatus && mockResponse.status >= 400);
console.log('- shouldThrowHttpError:', shouldThrowHttpError);

// Step 4: Should proceed to JSON parsing
const shouldParseJson = ok === true;
console.log('- shouldParseJson:', shouldParseJson);

if (shouldParseJson) {
  console.log('\nStep 4 - JSON parsing:');
  console.log('- response has json function:', typeof mockResponse.json === 'function');
  
  // Simulate the JSON parsing
  try {
    const data = await mockResponse.json();
    console.log('- parsed data:', data);
    
    // Step 5: Validate webhook response format
    const isValidWebhookResponse = (data) => {
      const obj = data;
      return (
        typeof data === 'object' &&
        data !== null &&
        typeof obj.success === 'boolean' &&
        (obj.success === false || typeof obj.response === 'string')
      );
    };
    
    const isValid = isValidWebhookResponse(data);
    console.log('- isValidWebhookResponse:', isValid);
    
    if (!isValid) {
      console.log('- Should throw VALIDATION_ERROR: Invalid response format');
    }
    
  } catch (error) {
    console.log('- JSON parsing error:', error.message);
  }
}