#!/usr/bin/env node

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { validateConceptName, buildConceptExplanation, ORD_CONCEPTS } from '../../src/ord-concepts.js';

describe('ORD Concepts Unit Tests', () => {
    
    describe('validateConceptName', () => {
        test('should validate existing concept names (case insensitive)', () => {
            assert.strictEqual(validateConceptName('Product'), 'Product');
            assert.strictEqual(validateConceptName('product'), 'Product');
            assert.strictEqual(validateConceptName('APIRESOURCE'), 'APIResource');
            assert.strictEqual(validateConceptName('package'), 'Package');
        });

        test('should throw error for invalid concept names', () => {
            assert.throws(() => validateConceptName('InvalidConcept'), /Unknown concept/);
            assert.throws(() => validateConceptName('NonExistent'), /Unknown concept/);
        });

        test('should throw error for empty or invalid input', () => {
            assert.throws(() => validateConceptName(''), /Concept name must be a non-empty string/);
            assert.throws(() => validateConceptName('   '), /Concept name cannot be empty or whitespace only/);
            assert.throws(() => validateConceptName(null), /Concept name must be a non-empty string/);
            assert.throws(() => validateConceptName(undefined), /Concept name must be a non-empty string/);
            assert.throws(() => validateConceptName(123), /Concept name must be a non-empty string/);
        });
    });

    describe('buildConceptExplanation', () => {
        test('should build explanation for valid concepts', () => {
            const explanation = buildConceptExplanation('Product');
            
            assert(explanation.includes('# ORD Concept: Product'), 'Should have concept title');
            assert(explanation.includes('## Description'), 'Should have description section');
            assert(explanation.includes('## Key Properties'), 'Should have key properties section');
            assert(explanation.includes('## Example'), 'Should have example section');
            assert(explanation.includes('commercial product'), 'Should contain concept description');
        });

        test('should build explanation for APIResource', () => {
            const explanation = buildConceptExplanation('APIResource');
            
            assert(explanation.includes('# ORD Concept: APIResource'), 'Should have concept title');
            assert(explanation.includes('High-level description of an exposed API'), 'Should contain concept description');
            assert(explanation.includes('ordId: Unique API identifier (MANDATORY)'), 'Should contain mandatory properties');
            assert(explanation.includes('```json'), 'Should contain JSON example');
        });

        test('should throw error for non-existent concepts', () => {
            assert.throws(() => buildConceptExplanation('NonExistent'), /Concept NonExistent not found/);
        });
    });

    describe('ORD_CONCEPTS data integrity', () => {
        test('should have all expected core concepts', () => {
            const expectedConcepts = [
                'Product', 'Package', 'APIResource', 'EventResource', 
                'EntityType', 'Capability', 'DataProduct', 'ConsumptionBundle'
            ];
            
            expectedConcepts.forEach(concept => {
                assert(ORD_CONCEPTS[concept], `Should have ${concept} concept`);
            });
        });

        test('should have required properties for each concept', () => {
            Object.entries(ORD_CONCEPTS).forEach(([name, concept]) => {
                assert(concept.description, `${name} should have description`);
                assert(Array.isArray(concept.keyProperties), `${name} should have keyProperties array`);
                assert(concept.example, `${name} should have example`);
            });
        });

        test('should have properly formatted examples', () => {
            Object.entries(ORD_CONCEPTS).forEach(([name, concept]) => {
                assert(typeof concept.example === 'object', `${name} example should be an object`);
                assert(concept.example !== null, `${name} example should not be null`);
            });
        });
    });
});
