import { describe, it, expect } from 'vitest';

describe('Basic Test', () => {
  it('should pass without any imports', () => {
    expect(1 + 1).toBe(2);
  });

  it('should work with simple operations', () => {
    const result = 'hello'.toUpperCase();
    expect(result).toBe('HELLO');
  });
});