#!/usr/bin/env node

import { OrdMcpServer } from '../src/index.js';

async function runTests() {
  console.log('🧪 Testing ORD MCP Server...\n');
  
  let server;
  let testsPassed = 0;
  let testsTotal = 0;

  try {
    // Test 1: Server initialization
    testsTotal++;
    console.log('Test 1: Server initialization');
    server = new OrdMcpServer();
    console.log('✅ Server initialized successfully\n');
    testsPassed++;

    // Test 2: Tools registration
    testsTotal++;
    console.log('Test 2: Tools registration');
    const tools = server.getAvailableTools();
    const expectedTools = [
      'search_ord_documentation',
      'explain_ord_concept', 
      'generate_ord_annotation',
      'analyze_cap_project',
      'validate_ord_metadata',
      'get_ord_examples'
    ];
    
    const missingTools = expectedTools.filter(tool => !tools.some(t => t.name === tool));
    if (missingTools.length === 0) {
      console.log('✅ All expected tools are registered');
      console.log(`   Found tools: ${tools.map(t => t.name).join(', ')}\n`);
      testsPassed++;
    } else {
      console.log(`❌ Missing tools: ${missingTools.join(', ')}\n`);
    }

    // Test 3: Explain ORD concept
    testsTotal++;
    console.log('Test 3: Explain ORD concept');
    try {
      const result = await server.handleToolCall('explain_ord_concept', {
        concept: 'Product',
        includeExamples: false
      });
      
      if (result && result.content && result.content.includes('ORD Product')) {
        console.log('✅ explain_ord_concept works correctly');
        console.log(`   Response length: ${result.content.length} characters\n`);
        testsPassed++;
      } else {
        console.log('❌ explain_ord_concept returned unexpected result\n');
      }
    } catch (error) {
      console.log(`❌ explain_ord_concept failed: ${error.message}\n`);
    }

    // Test 4: Generate ORD annotation (basic test)
    testsTotal++;
    console.log('Test 4: Generate ORD annotation');
    try {
      const sampleService = `
service TestService {
    entity Orders {
        id: UUID;
        orderNumber: String(20);
        customer: String(100);
    }
}`;
      
      const result = await server.handleToolCall('generate_ord_annotation', {
        serviceContent: sampleService,
        annotationType: 'basic'
      });
      
      if (result && result.content) {
        const content = typeof result.content === 'string' ? JSON.parse(result.content) : result.content;
        if (content.services && content.services.length > 0) {
          console.log('✅ generate_ord_annotation works correctly');
          console.log(`   Generated annotations for ${content.services.length} service(s)\n`);
          testsPassed++;
        } else {
          console.log('❌ generate_ord_annotation returned no services\n');
        }
      } else {
        console.log('❌ generate_ord_annotation returned no content\n');
      }
    } catch (error) {
      console.log(`❌ generate_ord_annotation failed: ${error.message}\n`);
    }

    // Test 5: Validate ORD metadata
    testsTotal++;
    console.log('Test 5: Validate ORD metadata');
    try {
      const sampleMetadata = {
        "openResourceDiscoveryVersion": "1.9.0",
        "products": [{
          "ordId": "test:product:sample:v1",
          "title": "Test Product",
          "shortDescription": "A test product",
          "vendor": "test:vendor:sample:v1"
        }],
        "vendors": [{
          "ordId": "test:vendor:sample:v1",
          "title": "Test Vendor"
        }]
      };
      
      const result = await server.handleToolCall('validate_ord_metadata', {
        metadata: sampleMetadata,
        strict: false
      });
      
      if (result && result.content) {
        const content = typeof result.content === 'string' ? JSON.parse(result.content) : result.content;
        if (typeof content.valid === 'boolean') {
          console.log('✅ validate_ord_metadata works correctly');
          console.log(`   Validation result: ${content.valid ? 'Valid' : 'Invalid'}`);
          console.log(`   Errors: ${content.errors?.length || 0}, Warnings: ${content.warnings?.length || 0}\n`);
          testsPassed++;
        } else {
          console.log('❌ validate_ord_metadata returned unexpected format\n');
        }
      } else {
        console.log('❌ validate_ord_metadata returned no content\n');
      }
    } catch (error) {
      console.log(`❌ validate_ord_metadata failed: ${error.message}\n`);
    }

    // Test 6: Get ORD examples
    testsTotal++;
    console.log('Test 6: Get ORD examples');
    try {
      const result = await server.handleToolCall('get_ord_examples', {
        useCase: 'REST API',
        serviceType: 'rest',
        complexity: 'basic'
      });
      
      if (result && result.content) {
        const content = typeof result.content === 'string' ? JSON.parse(result.content) : result.content;
        if (content.examples) {
          console.log('✅ get_ord_examples works correctly');
          console.log(`   Found ${content.totalFound} examples for REST API\n`);
          testsPassed++;
        } else {
          console.log('❌ get_ord_examples returned no examples\n');
        }
      } else {
        console.log('❌ get_ord_examples returned no content\n');
      }
    } catch (error) {
      console.log(`❌ get_ord_examples failed: ${error.message}\n`);
    }

  } catch (error) {
    console.error('❌ Critical error during testing:', error);
  }

  // Test summary
  console.log('='.repeat(50));
  console.log(`📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All tests passed! The ORD MCP Server is working correctly.');
    process.exit(0);
  } else {
    console.log(`❌ ${testsTotal - testsPassed} test(s) failed. Please check the implementation.`);
    process.exit(1);
  }
}

// Helper function to test if server can be imported
async function testImport() {
  try {
    console.log('🔍 Testing module imports...');
    const { OrdDocumentationIndexer } = await import('../src/indexer/ordDocIndexer.js');
    const { SemanticSearch } = await import('../src/search/semanticSearch.js');
    const { CapAnalyzer } = await import('../src/analyzers/capAnalyzer.js');
    const { AnnotationGenerator } = await import('../src/generators/annotationGenerator.js');
    const { OrdValidator } = await import('../src/analyzers/ordValidator.js');
    
    console.log('✅ All modules imported successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Module import failed:', error.message);
    return false;
  }
}

// Run tests
async function main() {
  const importSuccess = await testImport();
  if (importSuccess) {
    await runTests();
  } else {
    console.log('❌ Cannot run tests due to import failures');
    process.exit(1);
  }
}

main().catch(console.error);
