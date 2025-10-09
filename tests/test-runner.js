#!/usr/bin/env node

import { spawn } from 'child_process';
import { readdir } from 'fs/promises';
import { join } from 'path';

console.log('🧪 ORD MCP Server Test Suite\n');

async function runTests() {
    const testResults = {
        passed: 0,
        failed: 0,
        total: 0
    };

    // Get all test files
    const testDirs = ['unit', 'integration'];
    const testFiles = [];

    for (const dir of testDirs) {
        try {
            const files = await readdir(join('tests', dir));
            const testFilesInDir = files
                .filter(file => file.endsWith('.test.js'))
                .map(file => join('tests', dir, file));
            testFiles.push(...testFilesInDir);
        } catch (error) {
            console.log(`⚠️  No ${dir} test directory found`);
        }
    }

    if (testFiles.length === 0) {
        console.log('❌ No test files found');
        process.exit(1);
    }

    console.log(`📁 Found ${testFiles.length} test files:\n`);

    // Run each test file
    for (const testFile of testFiles) {
        console.log(`🏃 Running ${testFile}...`);
        
        const result = await runTestFile(testFile);
        testResults.total++;
        
        if (result.success) {
            testResults.passed++;
            console.log(`✅ ${testFile} - PASSED\n`);
        } else {
            testResults.failed++;
            console.log(`❌ ${testFile} - FAILED`);
            if (result.error) {
                console.log(`   Error: ${result.error}\n`);
            }
        }
    }

    // Summary
    console.log('=' .repeat(50));
    console.log(`📊 Test Results Summary:`);
    console.log(`   Total: ${testResults.total}`);
    console.log(`   Passed: ${testResults.passed}`);
    console.log(`   Failed: ${testResults.failed}`);
    
    if (testResults.failed === 0) {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log(`\n💥 ${testResults.failed} test file(s) failed`);
        process.exit(1);
    }
}

async function runTestFile(testFile) {
    return new Promise((resolve) => {
        const child = spawn('node', ['--test', testFile], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve({ success: true });
            } else {
                const error = stderr || stdout || `Exit code: ${code}`;
                resolve({ success: false, error: error.trim() });
            }
        });

        child.on('error', (error) => {
            resolve({ success: false, error: error.message });
        });
    });
}

// Handle process interruption
process.on('SIGINT', () => {
    console.log('\n\n⚠️  Test execution interrupted');
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('\n\n⚠️  Test execution terminated');
    process.exit(1);
});

// Run tests
runTests().catch((error) => {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
});
