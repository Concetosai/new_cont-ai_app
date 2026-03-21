import { test as base, expect } from '@playwright/test';

// Extend the test with any custom fixtures if needed
export const test = base.extend({
  // No custom fixtures for now
});

export { expect };
