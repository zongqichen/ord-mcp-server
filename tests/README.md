# ORD MCP Server Tests

This directory contains a comprehensive test suite for the ORD MCP Server, designed to be simple, effective, and easy to maintain.

## Test Structure

```
tests/
├── unit/                      # Unit tests for individual components
│   ├── ord-concepts.test.js   # Tests for concept validation & explanation
│   └── mcp-handlers.test.js   # Tests for MCP handler functions
├── integration/               # Integration tests for full server functionality
│   └── mcp-server.test.js     # Tests for complete MCP server operations
├── test-runner.js             # Custom test runner script
└── README.md                  # This file
```

## Running Tests

### All Tests
```bash
npm test
```
This runs the custom test runner that executes all test files and provides a summary.

### Unit Tests Only
```bash
npm run test:unit
```
Runs only the unit tests using Node.js built-in test runner.

### Integration Tests Only
```bash
npm run test:integration
```
Runs only the integration tests that spawn the actual MCP server.

### Watch Mode
```bash
npm run test:watch
```
Runs tests in watch mode, automatically re-running when files change.

## Test Coverage

### Unit Tests (`tests/unit/`)

**ord-concepts.test.js**
- ✅ Concept name validation (case insensitive)
- ✅ Error handling for invalid inputs
- ✅ Concept explanation generation
- ✅ Data integrity of ORD_CONCEPTS

**mcp-handlers.test.js**
- ✅ Specification fetching functionality
- ✅ Concept explanation handling
- ✅ Error handling for invalid arguments
- ✅ All available concepts validation

### Integration Tests (`tests/integration/`)

**mcp-server.test.js**
- ✅ Server startup and shutdown
- ✅ MCP protocol communication
- ✅ Tool listing (`tools/list`)
- ✅ Resource listing (`resources/list`)
- ✅ Tool execution (`get_ord_specification`, `explain_ord_concept`)
- ✅ Error handling for invalid tools and concepts

## Test Features

- **No External Dependencies**: Uses Node.js built-in test runner (Node.js 18+)
- **Fast Execution**: Unit tests complete in milliseconds
- **Comprehensive Coverage**: Tests both unit and integration scenarios
- **Clear Output**: Descriptive test names and error messages
- **Easy Debugging**: Focused test cases that are easy to isolate
- **Robust Integration Tests**: Handles server lifecycle and timeouts properly

## Test Philosophy

These tests follow the principle of being **simple and effective**:

1. **Simple**: No complex test frameworks or excessive setup
2. **Effective**: Comprehensive coverage of critical functionality
3. **Fast**: Quick feedback during development
4. **Reliable**: Consistent results across different environments
5. **Maintainable**: Easy to understand and modify

## Adding New Tests

### For Unit Tests
Add tests to the appropriate file in `tests/unit/` or create a new file following the pattern `*.test.js`.

### For Integration Tests
Add tests to `tests/integration/mcp-server.test.js` or create new integration test files.

### Test File Template
```javascript
#!/usr/bin/env node

import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Your Test Suite', () => {
    test('should do something', () => {
        // Your test code here
        assert.strictEqual(actual, expected);
    });
});
```

## Troubleshooting

### Integration Test Timeouts
If integration tests timeout, the server might be taking longer to respond. Check:
1. Network connectivity (for specification fetching)
2. Server startup time
3. Increase timeout in `sendRequest()` function if needed

### Unit Test Failures
Unit test failures usually indicate:
1. Changes in function signatures
2. Modified error messages
3. Data structure changes in ORD_CONCEPTS

### Server Won't Start
If the server fails to start during integration tests:
1. Check that all dependencies are installed (`npm install`)
2. Verify Node.js version (>=18.0.0)
3. Ensure no other process is using the same resources
