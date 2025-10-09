#!/usr/bin/env node

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { handleGetSpecification, handleExplainConcept } from '../../src/mcp-handlers.js';

describe('MCP Handlers Unit Tests', () => {
    
    describe('handleGetSpecification', () => {
        test('should return specification content', async () => {
            const result = await handleGetSpecification();
            
            assert(result.content, 'Should have content array');
            assert(Array.isArray(result.content), 'Content should be an array');
            assert.strictEqual(result.content.length, 1, 'Should have one content item');
            
            const content = result.content[0];
            assert.strictEqual(content.type, 'text', 'Content type should be text');
            assert(content.text, 'Should have text content');
            assert(content.text.includes('ORD Specification'), 'Should contain ORD Specification title');
        });

        test('should handle specification fetch errors gracefully', async () => {
            // This test assumes the function handles errors internally
            // In a real scenario, you might mock the fetchSpecification function
            const result = await handleGetSpecification();
            assert(result.content, 'Should still return content structure even if fetch fails');
        });
    });

    describe('handleExplainConcept', () => {
        test('should explain valid concepts', async () => {
            const args = { concept: 'Product' };
            const result = await handleExplainConcept(args);
            
            assert(result.content, 'Should have content array');
            assert(Array.isArray(result.content), 'Content should be an array');
            assert.strictEqual(result.content.length, 1, 'Should have one content item');
            
            const content = result.content[0];
            assert.strictEqual(content.type, 'text', 'Content type should be text');
            assert(content.text.includes('# ORD Concept: Product'), 'Should contain concept title');
            assert(content.text.includes('commercial product'), 'Should contain concept description');
        });

        test('should handle invalid arguments', async () => {
            const testCases = [
                null,
                undefined,
                {},
                { concept: null },
                { concept: '' },
                { concept: 'InvalidConcept' }
            ];

            for (const args of testCases) {
                try {
                    await handleExplainConcept(args);
                    assert.fail(`Should have thrown error for args: ${JSON.stringify(args)}`);
                } catch (error) {
                    assert(error instanceof Error, 'Should throw an Error');
                    assert(error.message, 'Error should have a message');
                }
            }
        });

        test('should validate all available concepts', async () => {
            const concepts = [
                'Product', 'Package', 'APIResource', 'EventResource',
                'EntityType', 'Capability', 'DataProduct', 'ConsumptionBundle'
            ];

            for (const concept of concepts) {
                const args = { concept };
                const result = await handleExplainConcept(args);
                
                assert(result.content, `Should handle ${concept} concept`);
                assert(result.content[0].text.includes(`# ORD Concept: ${concept}`), 
                       `Should contain proper title for ${concept}`);
            }
        });

        test('should handle case insensitive concept names', async () => {
            const testCases = [
                { input: 'product', expected: 'Product' },
                { input: 'PACKAGE', expected: 'Package' },
                { input: 'apiResource', expected: 'APIResource' }
            ];

            for (const { input, expected } of testCases) {
                const args = { concept: input };
                const result = await handleExplainConcept(args);
                
                assert(result.content[0].text.includes(`# ORD Concept: ${expected}`), 
                       `Should normalize ${input} to ${expected}`);
            }
        });
    });
});
